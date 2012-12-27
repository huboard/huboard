var uglify = require("uglify-js"),
lazy = require("lazy"),
jsp = uglify.parser,
pro = uglify.uglify,
path = require("path"),
fs = require("fs");

var args = process.argv.slice(2);

var lazy = new lazy(fs.createReadStream(args[0]))
.lines
.forEach(function(line){
    try {
    var file = path.join(args[1], line.toString());
    var data = fs.readFileSync(path.join(args[1],line.toString().replace(/[\r\n]/,"")),"utf8");
    var ast = jsp.parse(data),
    out = pro.gen_code(ast);
    process.stdout.write(";" + out + "\r\n");
    } catch (err) {
        console.log(err.message, err);
        process.stderr.write("Warning: " + file + " couldn't be found");
    }
});
