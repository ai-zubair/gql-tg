const fs = require("fs");
const fileData = fs.readFileSync("./schema.graphql",{encoding:"utf8"});
const typeArr = fileData.split(/\n(?=type|input|enum)/);
const trimmedArr = typeArr.map(string => string.trim().replace(/\n/g,""));
const finalArr = trimmedArr.map(string => JSON.parse(JSON.stringify(string)));
console.log(finalArr);