"use strict"

var fs = require('fs');
var path = require('path');

var program = require('commander');

/* Define configuration for commander */
program.version('0.0.1')
  .option('-n, --new', 'Create a test file')
  .option('--file [filename]', 'Filename to convert')
  .parse(process.argv);

function copyFile(from, to) {
  return fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

function convertThis() {
  if (program.new) {
    var newfile = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/examples/file.txt');
    copyFile(newfile, path.join(process.cwd(), "file.txt"));
  } else if (program.file) {
    var myfile = program.file;
    if (fs.existsSync(myfile)) {
      var content = fs.readFileSync(myfile, 'utf8');
      fs.writeFileSync(myfile, content.toUpperCase());
      console.log("Done");
    } else {
      console.log("File does not exist - " + myfile);
      console.log("OR Create a new file with the --new option");
    }
  } else {
    console.log("Pass a file name/path");
  }
}

exports.convert = convertThis;