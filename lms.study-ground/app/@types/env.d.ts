declare module "app-env" {
  interface ENV {
    apiUrl: string;
    userNodeEnv: string;
  }

  const appEnv: ENV;
  export default appEnv;
}
