const path = require('path');

const collection_names = ['firstNames','lastNames', 'dictionary'];

function execShellCommand(cmd) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}

collection_names.forEach(async collection => {
    let file = path.join(__dirname, "..\\", "db", collection + ".json");
    // let dropCollection = 'db.' + collection + ".drop()";
    // const status1 = await execShellCommand(dropCollection);
    // console.log(status1);

    let create_collection = 'mongoimport --db atsign --collection ' + collection + ' --file ' + file + ' --jsonArray';
    // const status2 = await execShellCommand(create_collection)
    // console.log(status2);
})