# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.python3
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
      "google.gemini-cli-vscode-ide-companion"
    ];
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        # 백엔드 API 서버 (포트 3001)
        server = {
          command = ["node" "server/index.js"];
          manager = "process";
          env = { PORT = "3001"; };
        };
        # 프론트엔드 Vite 개발 서버 (포트 5173)
        web = {
          command = ["npm" "run" "dev" "--prefix" "client"];
          manager = "web";
          env = { PORT = "$PORT"; };
        };
      };
    };
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        install-deps = "npm run install:all";
        default.openFiles = [ "client/src/App.tsx" "README.md" ];
      };
      # Runs when the workspace is (re)started
      onStart = {
        start-server = "node server/index.js &";
      };
    };
  };
}
