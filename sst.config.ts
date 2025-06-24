// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "prompt3d",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    console.log($app.stage);
    new sst.aws.Nextjs("Prompt3D", {
      domain: $app.stage === "production" 
        ? {
            name: "prompt3d.co",
            redirects: ["www." + "prompt3d.co"],
            aliases: ["c3d.cxmpute.cloud"],
          }
        : {
            name: "dev.prompt3d.co",
          },
    });
  },
});
