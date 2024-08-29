const { sequelize } = require("./db/models");

// this code is used in production and development and it lets us use the schema we set up the good thing about this is if we have multiple projects this allows us to partition our db so we can use the same db in a different project and if we have 2 projects with lets say users it would be in 2 different db as to not cause problems
sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if (!data.includes(process.env.SCHEMA)) {
    await sequelize.createSchema(process.env.SCHEMA);
  }
});
