
const PATH = require("path");
const EXEC = require("child_process").exec;


module.exports.overlays = {
    name: "mongodb",
    defaultConfig: {
        "port": null
    },
    toStandardConfig: function(config) {
        return {
            "io": {
                "port": (config && config.port) || null
            }
        };
    },
    fromStandardConfig: function(config) {
        return {
            "port": config.io.port
        };
    },
    getLaunchScript: function($pinf, config, options) {
        // @see http://docs.mongodb.org/manual/reference/program/mongod/#bin.mongod
        var args = [
            "mongod",
            "--port", config.port,
            "--dbpath", PATH.dirname($pinf.makePath("data", "db/~"))
        ];
        args = args.concat([
            ">", options.stdoutPath,
            "2>", options.stderrPath
        ]);
        return [
            "#!/bin/sh",
            args.join(" ")
        ].join("\n");
    },
    isRunning: function($pinf, config, callback) {
        return EXEC([
            "mongostat",
            "--port", config.port,
            "-n", 1,
            0
        ].join(" "), function (err, stdout, stderr) {
            if (err) {
                if (/couldn't connect/.test(err.message)) return callback(null, false);
                return callback(err);
            }
            if (/connected to/.test(stdout)) return callback(null, true);
            return callback(null, false);
        });
    }
};

require("pinf-io-daemonize/io").forModule(module, module.exports.overlays);
