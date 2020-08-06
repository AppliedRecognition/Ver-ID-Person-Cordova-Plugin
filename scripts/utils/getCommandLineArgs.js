const { ArgumentParser } = require('argparse');

module.exports = function (context) {
    const { cmdLine } = context;

    if (cmdLine) {
        const parser = new ArgumentParser({ addHelp: false });
        parser.addArgument(['--password']);
        parser.addArgument(['--certificate']);

        let args = parser.parseKnownArgs();

        args = args.length > 0 ? args[0] : {};

        if (args.password && args.certificate) {
            return args;
        }
        console.error('Password and certicate not found in arguments');
    }
    return null;
};
