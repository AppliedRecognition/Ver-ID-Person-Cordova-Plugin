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
            if let users: [VerIDUser] = try? VerID.shared.registeredVerIDUsers() {
//                let messageUsers: [[String:Any]] = users.map { ["userId":$0.userId,"bearings":$0.bearingsArray] }
//                let message: [AnyHashable: Any] = ["users": messageUsers]
                let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: users)
                DispatchQueue.main.async {
                    self.commandDelegate.send(result, callbackId: command.callbackId)
                }
            } else {
                DispatchQueue.main.async {
                    self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
                }
            }
        }
    }
    
    @objc public func deleteUser(_ command: CDVInvokedUrlCommand) {
        if let userId = command.arguments?.flatMap({ ($0 as? [String:String])?["userId"] }).first {
            commandDelegate.run {
                VerID.shared.deregisterUser(userId)
                let result = CDVPluginResult(status: CDVCommandStatus_OK)
                DispatchQueue.main.async {
                    self.commandDelegate.send(result, callbackId: command.callbackId)
                }
            }
        } else {
            self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    // MARK: - VerID Session Delegate
    
    public func session(_ session: VerIDSession, didFinishWithResult result: VerIDSessionResult) {
        guard let callbackId = self.veridSessionCallbackId, !callbackId.isEmpty else {
            return
        }
        self.veridSessionCallbackId = nil
        self.commandDelegate.run {
            var message: [String:Any] = [:]
            if !result.images.isEmpty {
                var images: [String] = []
                var faces: [[String:Any]] = []
                for (face, imageURL) in result.faceImages(withBearing: .straight) {
                    if let imageData = try? Data(contentsOf: imageURL), let image = UIImage(data: imageData), let jpeg = UIImageJPEGRepresentation(image, 0.95) {
                        images.append(jpeg.base64EncodedString())
                        var faceObj: [String:Any] = [:]
                        faceObj["x"] = face.bounds.minX
                        faceObj["y"] = face.bounds.minY
                        faceObj["width"] = face.bounds.width
                        faceObj["height"] = face.bounds.height
                        if let template = face.template?.map({ NSNumber(value: $0) }) {
                            faceObj["template"] = TemplateUtil.float32ArrayToBase64(template)
                        }
                        faces.append(faceObj)
                    }
                }
                if !images.isEmpty {
                    message["images"] = images
                    message["faces"] = faces
                }
            }
            message["outcome"] = result.outcome.rawValue
            DispatchQueue.main.async {
                self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: message), callbackId: callbackId)
            }
        }
    }
    
    
    // MARK: - Session helpers
    
    private func createSettings<T: VerIDSessionSettings>(_ args: [Any]?) -> T {
        guard let jsonSettings = args?.flatMap({ ($0 as? [String:[String:Any]])?["settings"] }).first else {
            NSLog("Unable to parse settings")
            return self.defaultSettings()
        }
        guard let encoded = try? JSONSerialization.data(withJSONObject: jsonSettings, options: .init(rawValue: 0)) else {
            NSLog("Unable to encode settings as JSON")
            return self.defaultSettings()
        }
        guard let decoded = try? JSONDecoder().decode(T.self, from: encoded) else {
            if let str = String(data: encoded, encoding: .utf8) {
                NSLog("Unable to decode settings from JSON: %@", str)
            } else {
                NSLog("Unable to decode settings from JSON")
            }
            return self.defaultSettings()
        }
        if let str = String(data: encoded, encoding: .utf8) {
            NSLog("Decoded settings %@ from JSON: %@", String(describing: T.self), str)
        }
        return decoded
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
            switch type {
            case is VerIDRegistrationSession.Type:
                let regSessionSettings: VerIDRegistrationSessionSettings = self.createSettings(command.arguments)
                veridSession = VerIDRegistrationSession(settings: regSessionSettings)
            case is VerIDAuthenticationSession.Type:
                let authSessionSettings: VerIDAuthenticationSessionSettings = self.createSettings(command.arguments)
                veridSession = VerIDAuthenticationSession(settings: authSessionSettings)
            case is VerIDLivenessDetectionSession.Type:
                let livenessSessionSettings: VerIDLivenessDetectionSessionSettings = self.createSettings(command.arguments)
                veridSession = VerIDLivenessDetectionSession(settings: livenessSessionSettings)
            default:
                veridSession = VerIDSession()
            }
            self.veridSessionCallbackId = command.callbackId
            veridSession.delegate = self
            veridSession.start()
        }
    }
    
    func loadVerID(_ command: CDVInvokedUrlCommand, callback: @escaping () -> Void) {
        let apiSecret = command.arguments?.flatMap({ ($0 as? [String:String])?["apiSecret"] }).first
        if !VerID.shared.isLoaded {
            VerID.shared.load(apiSecret) { (success, error) in
                if error == nil && success {
                    callback()
                } else {
                    self.commandDelegate.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
                }
            }
        } else {
            callback()
        }
    }
}
