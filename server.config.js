module.exports = {
  apps : [
      {
        name: "Loup d'argent",
        script: "./index.js",
        watch: true,
        env: {
            "NODE_ENV": "production"
        }
      }
  ]
}

