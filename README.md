# GQL-TG [![NPM](https://nodei.co/npm/gql-tg.png?mini=true)](https://nodei.co/npm/gql-tg/)  [![npm version](https://badge.fury.io/js/gql-tg.svg)](https://badge.fury.io/js/gql-tg) [![HitCount](http://hits.dwyl.com/ai-zubair/gql-tg.svg)](http://hits.dwyl.com/ai-zubair/gql-tg) [![dependencies](https://david-dm.org/ai-zubair/gql-tg.svg)](https://david-dm.org/ai-zubair/gql-tg.svg) [![issues](https://img.shields.io/github/issues/ai-zubair/gql-tg)](https://img.shields.io/github/issues/ai-zubair/gql-tg)
An automatic TS type definitions generator for GraphQL operations' resolvers.

## ChangeLog [![changelog](https://img.shields.io/badge/Version-1.1.0-brightgreen)](https://img.shields.io/badge/Version-1.1.0-brightgreen)
- Fixed the schema file reading issue.
- Added support for custom schema file path/name.
- Added support for custom definitions file path/name.

## Why?
Type defintions are awesome. Which is why we love Typescript. Our inclination towards **GraphQL** is never ending for the ease and scalability it brings to our application servers. Here's the pain though:  

***Custom writing the type defintions for arguments and return values of the GraphQL resolvers***.

Ta-Da! Wait no more! **gql-tg** brings static typings into your TypeScript resolvers for the GraphQL operations.

## How?
**gql-tg** reads the specified graphql schema file, going through all the root operations and non scalar types found in the schema file and generates the TypeScript type definitions for the GraphQL:
- Operations' Arguments
- Operations' Non scalar return values
- Non scalar types [ *Input Type*, *Object Type*, *Union Type*, *Interface Type*, *Enum Type* ]
- ***Fragments( Support coming soon!)***

for use in the corresponding resolvers meant for the operations. 
The type generator is internally based on **three high level components** as per the specified design:
 [![design](https://raw.githubusercontent.com/ai-zubair/gql-tg/master/process.png)](https://raw.githubusercontent.com/ai-zubair/gql-tg/master/process.png)
- **Tokenizer**: Reads the GraphQL definitions and identifies the constituent tokens.
- **Parser**: Parses Tokenized Definitions into JS objects.
- **Transpiler**: Writes the TS type definition from the parsed JS objects.

## CLI
The CLI can be installed both:
-Locally   `npm i --save-dev gql-tg`
-Globally  `npm i -g gql-tg` 

The installed CLI exposes the **typegen** command which generates the type definitions by synchronously writing to the specified definitions file. 

##### OPTIONS
The CLI supports two options as of now:
- Input schema file path/name. *(Defaults to **'schema.graphql'** file in the **PWD**)*
- Output definitions file path/name. *(Defaults to **'definitions.ts'** file in the **PWD**)*

Since, the CLI options are processed via the Node's native **PROCESS***(process.argv)* object, they must be specified as plain-text strings without any verbose option prefixes, exactly in the order:
```
$ typegen   path/to/schema/file.graphql   path/to/type/definitions/file.ts
```
***Paths are resolved relative to the current working directory.***

e.g. For the following project structure: 
```
|-src
    |-schema.graphql
    |-js/
    |-types/
|-package.json
|-.gitignore
```
To generate the type definitions into the **/src/js/**, executing the command *(installed globally)* from the **project root**:
```
~/path/to/project-root$ typegen ./src/schema.graphql ./src/js/gqlTypeDefinitions.ts
```

## Contribute [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

To get started:
1. Clone the repo onto your local machine. `git clone https://github.com/ai-zubair/gql-tg.git`
2. Install the dependencies(mainly developmental) `npm i` 
3. Build the project `npm start`
4. The source files are read from `src` directory and the build files are written to the `build` directory, both in the project root. This can be changed in `tsconfig.json`.

The project stands in the intial phase for now. As such, suggestions, improvements, issues, features are openly welcome.