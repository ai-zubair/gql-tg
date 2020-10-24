## CHANGELOG 1.1.0
- Added support for custom schema file path/name.
- Added support for custom definitions file path/name.
- Fixed the schema file reading issue.
- Added default schema file path and definitions file path.

## Why?
Type defintions are awesome. Which is why we love Typescript. Our love for **GraphQL** is endless for the ease and scalability it brings to our application servers. Here's the pain though:  

***Custom writing the type defintions for arguments and return values of the GraphQL resolvers***.

Ta-Da! Wait no more! **gql-tg** brings static typings into your typescript resolvers for the Graph QL operations.

## How?
**gql-tg** reads the specified graphql schema file, going through all the root operations and non scalar types found in the schema file and generates the TypeScript type definitions for the GraphQL:
- Operations' Arguments
- Operations' Non scalar return values
- Non scalar types [ *Input Type*, *Object Type*, *Union Type*, *Interface Type*, *Enum Type* ]

for use in the corresponding resolvers meant for the operations.

*NOTE: Suppport for GraphQL fragments comming soon!*

## CLI
To get the CLI:

```
npm i --save-dev gql-tg
```

The installed CLI exposes the **typegen** command which generates the type definitions by synchronously writing to the specified definitions file. 

##### OPTIONS
The CLI supports two options as of now:
- Input schema file path/name. *(Defaults to **'schema.graphql'** file in the **PWD**)*
- Output definitions file path/name. *(Defaults to **'definitions.ts'** file in the **PWD**)*

Since, the CLI options are processed via the Node's native **PROCESS***(process.argv)* object, they must be specified as plain-text strings without any verbose option prefixes, exactly in the order:
```
$ typegen   path/to/schema/file.graphql   path/to/type/definitions/file.ts
```
*NOTE: The specified paths are processed relative to the current working directory.*

e.g.
For the following project structure: 
```
|-src
    |-schema.graphql
    |-js/
    |-types/
|-package.json
|-.gitignore
```
To generate the type definitions into the **/src/js/**, executing the command from the **project root**:
```
~/path/to/project-root$ typegen ./src/schema.graphql ./src/js/gqlTypeDefinitions.ts
```

## Contribute

To get started:
1. Clone the repo onto your local machine. `git clone https://github.com/ai-zubair/gql-tg.git`
2. Install the dependencies(mainly developmental) `npm i` 
3. Build the project `npm start`
4. The source files are read from `src` directory and the build files are written to the `build` directory, both in the project root. This can be changed in `tsconfig.json`.

The project stands in the intial phase for now. As such, suggestions, improvements, issues, features are openly welcome.