const fs = require("fs-extra");

const createFile = (fileName, content) => {
    fs.writeFile(fileName, content, function(err) {
        if (err) throw err;
    });
};

const replaceSpaces = (str) => {
    return str.replaceAll(" ","-");
};

const saveTitle = (str) => {
    return str.replaceAll(" ","-").replaceAll("|","").replaceAll(",","").toLowerCase();
};

const navigationData = (indexJson) => {
    
};

module.exports = {createFile, replaceSpaces, saveTitle, navigationData};


