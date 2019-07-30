import UIKit
import VerID

@objc(VerIDPlugin) public class VerIDPlugin: CDVPlugin, VerIDSessionDelegate {
    
    private var veridSessionCallbackId: String?
    
    @objc public func load(_ command: CDVInvokedUrlCommand) {
        self.loadVerID(command) {
            self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_OK), callbackId: command.callbackId)
        }
    }
    
    @objc public func unload(_ command: CDVInvokedUrlCommand) {
        VerID.shared.unload()
        self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_OK), callbackId: command.callbackId)
    }
    
    @objc public func registerUser(_ command: CDVInvokedUrlCommand) {
        self.startSessionWithType(VerIDRegistrationSession.self, command: command)
    }
    
    @objc public func authenticate(_ command: CDVInvokedUrlCommand) {
        self.startSessionWithType(VerIDAuthenticationSession.self, command: command)
    }
    
    @objc public func captureLiveFace(_ command: CDVInvokedUrlCommand) {
        self.startSessionWithType(VerIDLivenessDetectionSession.self, command: command)
    }
    
    @objc public func getRegisteredUsers(_ command: CDVInvokedUrlCommand) {
        commandDelegate.run {
            var err: String = "Unknown error"
            do {
                let veridUsers = try VerID.shared.registeredVerIDUsers()
                var users: [String] = []
                for user in veridUsers {
                    if !users.contains(user.userId) {
                        users.append(user.userId)
                    }
                }
                if let usersString = String(data: try JSONEncoder().encode(users), encoding: .utf8) {
                    DispatchQueue.main.async {
                        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: usersString)
                        self.commandDelegate.send(result, callbackId: command.callbackId)
                    }
                    return
                } else {
                    err = "Failed to encode JSON as UTF-8 string"
                }
            } catch {
                err = error.localizedDescription
            }
            DispatchQueue.main.async {
                self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: err), callbackId: command.callbackId)
            }
        }
    }
    
    @objc public func deleteUser(_ command: CDVInvokedUrlCommand) {
        if let userId = command.arguments?.compactMap({ ($0 as? [String:String])?["userId"] }).first {
            commandDelegate.run {
                VerID.shared.deregisterUser(userId)
                let result = CDVPluginResult(status: CDVCommandStatus_OK)
                DispatchQueue.main.async {
                    self.commandDelegate.send(result, callbackId: command.callbackId)
                }
            }
        } else {
            self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: "Unable to parse userId argument"), callbackId: command.callbackId)
        }
    }
    
    @objc public func compareFaces(_ command: CDVInvokedUrlCommand) {
        if let t1 = command.arguments?.compactMap({ ($0 as? [String:String])?["face1"] }).first?.data(using: .utf8), let t2 = command.arguments?.compactMap({ ($0 as? [String:String])?["face2"] }).first?.data(using: .utf8) {
            commandDelegate.run {
                do {
                    let template1: FaceTemplate
                    if let template = try? JSONDecoder().decode(FaceTemplate.self, from: t1) {
                        template1 = template
                    } else if let face = try? JSONDecoder().decode(Face.self, from: t1), let template = face.face.faceTemplate {
                        template1 = template
                    } else {
                        throw NSError(domain: "com.appliedrec.verid", code: 1, userInfo: [NSLocalizedDescriptionKey:"Invalid face template argument"])
                    }
                    let template2: FaceTemplate
                    if let template = try? JSONDecoder().decode(FaceTemplate.self, from: t2) {
                        template2 = template
                    } else if let face = try? JSONDecoder().decode(Face.self, from: t2), let template = face.face.faceTemplate {
                        template2 = template
                    } else {
                        throw NSError(domain: "com.appliedrec.verid", code: 1, userInfo: [NSLocalizedDescriptionKey:"Invalid face template argument"])
                    }
                    let score = try FaceUtil.compareFaceTemplate(template1, to: template2).floatValue
                    DispatchQueue.main.async {
                        let message: [String:Any] = ["score":score,"authenticationThreshold":0.5,"max":1.0];
                        self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: message), callbackId: command.callbackId)
                    }
                } catch {
                    DispatchQueue.main.async {
                        self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: error.localizedDescription), callbackId: command.callbackId)
                    }
                }
            }
        } else {
            DispatchQueue.main.async {
                self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: "Unable to parse template1 and/or template2 arguments"), callbackId: command.callbackId)
            }
        }
    }
    
    @objc public func detectFaceInImage(_ command: CDVInvokedUrlCommand) {
        self.loadVerID(command) {
            self.commandDelegate.run(inBackground: {
                do {
                    guard let imageString = command.arguments?.compactMap({ ($0 as? [String:String])?["image"] }).first else {
                        throw VerIDPluginError.invalidArgument
                    }
                    guard imageString.starts(with: "data:image/"), let mimeTypeEndIndex = imageString.firstIndex(of: ";"), let commaIndex = imageString.firstIndex(of: ",") else {
                        throw VerIDPluginError.invalidArgument
                    }
                    let dataIndex = imageString.index(commaIndex, offsetBy: 1)
                    guard String(imageString[mimeTypeEndIndex..<imageString.index(mimeTypeEndIndex, offsetBy: 7)]) == ";base64" else {
                        throw VerIDPluginError.invalidArgument
                    }
                    guard let data = Data(base64Encoded: String(imageString[dataIndex...])) else {
                        throw VerIDPluginError.invalidArgument
                    }
                    guard let image = UIImage(data: data) else {
                        throw VerIDPluginError.invalidArgument
                    }
                    let face = try VerID.shared.detectFaceInImage(image, keepForRecognition: true)
                    guard let encodedFace = String(data: try JSONEncoder().encode(Face(face: face)), encoding: .utf8) else {
                        throw VerIDPluginError.encodingError
                    }
                    DispatchQueue.main.async {
                        self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: encodedFace), callbackId: command.callbackId)
                    }
                } catch {
                    DispatchQueue.main.async {
                        self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: error.localizedDescription), callbackId: command.callbackId)
                    }
                }
            })
        }
    }
    
    // MARK: - VerID Session Delegate
    
    public func session(_ session: VerIDSession, didFinishWithResult result: VerIDSessionResult) {
        guard let callbackId = self.veridSessionCallbackId, !callbackId.isEmpty else {
            return
        }
        self.veridSessionCallbackId = nil
        self.commandDelegate.run {
            var err = "Unknown error"
            do {
                if result.outcome == .cancel {
                    DispatchQueue.main.async {
                        self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_OK), callbackId: callbackId)
                    }
                    return
                }
                if let message = String(data: try JSONEncoder().encode(SessionResult(result: result)), encoding: .utf8) {
                    DispatchQueue.main.async {
                        self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: message), callbackId: callbackId)
                    }
                    return
                } else {
                    err = "Unabe to encode JSON as UTF-8 string"
                }
            } catch {
                err = error.localizedDescription
            }
            DispatchQueue.main.async {
                self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: err), callbackId: callbackId)
            }
        }
    }
    
    
    // MARK: - Session helpers
    
    private func createSettings<T: VerIDSessionSettings>(_ args: [Any]?) throws -> T {
        guard let string = args?.compactMap({ ($0 as? [String:String])?["settings"] }).first, let data = string.data(using: .utf8) else {
            NSLog("Unable to parse settings")
            throw VerIDPluginError.parsingError
        }
        let settings = try JSONDecoder().decode(T.self, from: data)
        settings.includeFaceTemplatesInResult = true
        NSLog("Decoded settings %@ from %@", String(describing: T.self), string)
        return settings
    }
    
    private func defaultSettings<T: VerIDSessionSettings>() -> T {
        switch T.self {
        case is VerIDRegistrationSessionSettings.Type:
            return VerIDRegistrationSessionSettings() as! T
        case is VerIDAuthenticationSessionSettings.Type:
            return VerIDAuthenticationSessionSettings() as! T
        case is VerIDLivenessDetectionSessionSettings.Type:
            return VerIDLivenessDetectionSessionSettings() as! T
        default:
            return VerIDSessionSettings() as! T
        }
    }
    
    private func startSessionWithType<T: VerIDSession>(_ type: T.Type, command: CDVInvokedUrlCommand) {
        guard self.veridSessionCallbackId == nil || self.veridSessionCallbackId!.isEmpty else {
            self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
            return
        }
        self.loadVerID(command) {
            let veridSession: VerIDSession
            do {
                switch type {
                case is VerIDRegistrationSession.Type:
                    let regSessionSettings: VerIDRegistrationSessionSettings = try self.createSettings(command.arguments)
                    veridSession = VerIDRegistrationSession(settings: regSessionSettings)
                case is VerIDAuthenticationSession.Type:
                    let authSessionSettings: VerIDAuthenticationSessionSettings = try self.createSettings(command.arguments)
                    veridSession = VerIDAuthenticationSession(settings: authSessionSettings)
                case is VerIDLivenessDetectionSession.Type:
                    let livenessSessionSettings: VerIDLivenessDetectionSessionSettings = try self.createSettings(command.arguments)
                    veridSession = VerIDLivenessDetectionSession(settings: livenessSessionSettings)
                default:
                    veridSession = VerIDSession()
                }
            } catch {
                self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: error.localizedDescription), callbackId: command.callbackId)
                return
            }
            self.veridSessionCallbackId = command.callbackId
            veridSession.delegate = self
            veridSession.start()
        }
    }
    
    func loadVerID(_ command: CDVInvokedUrlCommand, callback: @escaping () -> Void) {
        let apiSecret = command.arguments?.compactMap({ ($0 as? [String:String])?["apiSecret"] }).first
        if !VerID.shared.isLoaded {
            VerID.shared.load(apiSecret) { (success, error) in
                if error == nil && success {
                    callback()
                } else {
                    let err = error?.localizedDescription ?? "Unknown error"
                    self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: err), callbackId: command.callbackId)
                }
            }
        } else {
            callback()
        }
    }
}

public enum VerIDPluginError: Int, Error {
    case parsingError, invalidArgument, encodingError
}

fileprivate class Face: Codable {
    
    enum FaceCodingKeys: String, CodingKey {
        case x, y, width, height, yaw, pitch, roll, quality, faceTemplate
    }
    
    let face: VerIDFace
    
    init(face: VerIDFace) {
        self.face = face
    }
    
    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: FaceCodingKeys.self)
        let template = try container.decode(FaceTemplate.self, forKey: .faceTemplate)
        self.face = try VerIDFace(faceTemplate: template)
    }
    
    func encode(to encoder: Encoder) throws {
        var faceContainer = encoder.container(keyedBy: FaceCodingKeys.self)
        try faceContainer.encode(face.bounds.minX, forKey: .x)
        try faceContainer.encode(face.bounds.minY, forKey: .y)
        try faceContainer.encode(face.bounds.width, forKey: .width)
        try faceContainer.encode(face.bounds.height, forKey: .height)
        try faceContainer.encode(face.rotation.yaw, forKey: .yaw)
        try faceContainer.encode(face.rotation.pitch, forKey: .pitch)
        try faceContainer.encode(face.rotation.roll, forKey: .roll)
        try faceContainer.encode(face.quality, forKey: .quality)
        try faceContainer.encodeIfPresent(face.faceTemplate, forKey: .faceTemplate)
    }
}

fileprivate class SessionResult: Encodable {
    
    enum SessionResultCodingKeys: String, CodingKey {
        case attachments, error
    }
    
    enum AttachmentCodingKeys: String, CodingKey {
        case face, image, bearing
    }
    
    enum ErrorCodingKeys: String, CodingKey {
        case code, domain, description
    }
    
    let result: VerIDSessionResult
    
    init(result: VerIDSessionResult) {
        self.result = result
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: SessionResultCodingKeys.self)
        var attachmentsContainer = container.nestedUnkeyedContainer(forKey: .attachments)
        for (face, imageUrl) in result.faceImages {
            var attachmentContainer = attachmentsContainer.nestedContainer(keyedBy: AttachmentCodingKeys.self)
            try attachmentContainer.encode(Face(face: face), forKey: .face)
            let bearingString: String
            switch face.bearing {
            case .straight:
                bearingString = "STRAIGHT"
            case .up:
                bearingString = "UP"
            case .rightUp:
                bearingString = "RIGHT_UP"
            case .right:
                bearingString = "RIGHT"
            case .rightDown:
                bearingString = "RIGHT_DOWN"
            case .down:
                bearingString = "DOWN"
            case .leftDown:
                bearingString = "LEFT_DOWN"
            case .left:
                bearingString = "LEFT"
            case .leftUp:
                bearingString = "LEFT_UP"
            }
            try attachmentContainer.encode(bearingString, forKey: .bearing)
            if let imageData = (try? Data(contentsOf: imageUrl))?.base64EncodedString() {
                let mimeType: String!
                switch imageUrl.pathExtension {
                case "jpg", "jpeg":
                    mimeType = "image/jpeg"
                case "png":
                    mimeType = "image/png"
                default:
                    mimeType = nil
                }
                if mimeType != nil {
                    let imageDataURI = String(format: "data:%@;base64,%@", mimeType, imageData)
                    try attachmentContainer.encode(imageDataURI, forKey: .image)
                }
            }
        }
        if result.outcome != .success {
            var errorContainer = container.nestedContainer(keyedBy: ErrorCodingKeys.self, forKey: .error)
            try errorContainer.encode(result.outcome.rawValue, forKey: .code)
            try errorContainer.encode("com.appliedrec.verid", forKey: .domain)
            let errorDescription: String
            switch result.outcome {
            case .failNumberOfResults:
                errorDescription = "Failed to collect requested number of results"
            case .unknownFailure:
                errorDescription = "Unknown failure"
            case .failAntiSpoofingChallenge:
                errorDescription = "Failed anti-spoofing challenge"
            case .failNotLoaded:
                errorDescription = "Ver-ID not loaded"
            case .detRecLibFailure:
                errorDescription = "Ver-ID face detection library error"
            case .faceLost:
                errorDescription = "Face lost"
            case .notAuthenticated:
                errorDescription = "Not authenticated"
            default:
                errorDescription = "Unknown error"
            }
            try errorContainer.encode(errorDescription, forKey: .description)
        }
    }
}
