var exec = require("child_process").exec,
  child;
const fs = require("fs");
const path = require("path");

const removeDir = dirPath => {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  let list = fs.readdirSync(dirPath);
  list.forEach((item, index) => {
    let fileName = path.join(dirPath, item);
    let stat = fs.statSync(fileName);
    if (fileName === "." || fileName === "..") {
    } else if (stat.isDirectory()) {
      removeDir(fileName);
    } else {
      fs.unlinkSync(fileName);
    }
  });

  fs.rmdirSync(dirPath);
};

module.exports = {
  exe: (req, res, next) => {
    const content = req.body.content;
    console.log(req.body);
    fs.writeFile("input.moe", content, error => {
      if (error) {
        return res.status(500).json({
          error1: error
        });
      }
      child = exec(
        `java -jar jar/spegmoe.jar input.moe`,
        (erro, stdout, stder) => {
          if (erro) {
            return res.status(500).json({
              error1: erro
            });
          }
          fs.readFile("output/output.txt", "utf8", (err, data) => {
            if (err) {
              return res.status(500).json({
                error1: err
              });
            }
            fs.readFile("output/errors.txt", "utf8", (er, dat) => {
              if (err) {
                return res.status(500).json({
                  error1: err,
                  error2: er
                });
              } else {
                if (fs.existsSync("output/input.p")) {
                  child = exec(
                    "java -jar jar/spegmoe_vm.jar output/input.p > output/finalOutput.txt",
                    () => {
                      fs.readFile(
                        "output/finalOutput.txt",
                        "utf8",
                        (ERROR, dat) => {
                          removeDir("output/");
                          return res.status(200).json({
                            ok: true,
                            output: dat
                          });
                        }
                      );
                    }
                  );
                } else {
                  removeDir("output/");
                  return res.status(200).json({
                    ok: false,
                    output: dat
                  });
                }
              }
            });
          });
        }
      );
    });
  }
};
