{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
  ];
  env = {};
  idx = {
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev"];
          manager = "web";
          env = { PORT = "$PORT"; };
        };
      };
    };
    workspace = {
      onCreate = {
        install-deps = "npm install";
        default.openFiles = [ "src/App.tsx" "README.md" ];
      };
    };
  };
}
