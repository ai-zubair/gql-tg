# Why?
Type defintions are awesome. Which is why we love Typescript. Our love for **GraphQL** is endless for the ease and scalability it brings to our application servers. Here's the pain though:  
***Custom writing the type defintions for arguments and return values of the GraphQL resolvers***. 
Ta-Da! Wait no more! **gql-type-gen** brings static typings into your typescript resolvers for the Graph QL operations' resolvers.

# How?
**gql-type-gen** reads the graphql schema file located in the command's execution directory and recursively goes through all the GraphQL operations found in the schema file, generating type definitions both for the operations' resolver arguments as well as the return value. 

# CLI
To get the CLI:

```
npm i --save-dev gql-type-gen
```

The installed CLI exposes the **typegen** command which generates the type definitions by synchronously writing to a file located in command's execution directory(pwd). As of now, in the current version no CLI options are supported. 

**Workflow:**
1. Create the graphql schema file exactly with the name ***schema.graphql***.
2. Navigate to the project directory containing the schema file.
3. Execute the command.
4. Type definition file  ***definitions.ts*** is written to the same directory.

e.g. If the **schema.grpahql** file is located in the project root, to get the type definitions generated in the same directory: 

```
  ~/path/to/project-root$ typegen
```

***NOTE: Support for custom input schema file path, output type definitions file path and output definitions file name is coming soon!***

# Contribute

To get started:
1. Clone the repo onto your local machine. `git clone https://github.com/ai-zubair/gql-type-gen.git`
2. Install the dependencies(mainly developmental) `npm i` 
3. Build the project `npm start`
4. The source files are read from `src` directory and the build files are written to the `build` directory, both in the project root. This can be changed in `tsconfig.json`.

The project stands in the intial phase for now. As such, suggestions, improvements, issues, features are openly welcome.