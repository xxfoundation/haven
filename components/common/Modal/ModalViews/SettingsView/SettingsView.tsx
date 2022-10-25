import { FC } from "react";
import s from "./SettingsView.module.scss";
import { Download, Export } from "@components/icons";
import cn from "classnames";
import { useUI } from "@contexts/ui-context";

const SettingsView: FC<{}> = ({}) => {
  const { openModal, setModalView } = useUI();

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-8">Settings</h2>
      <div className={s.wrapper}>
        <div>
          <h3 className="headline--sm">Download logs</h3>
          <Download
            onClick={() => {
              const filename = (window as any).logFile?.Name();
              const data = (window as any).logFile?.GetFile();
              const file = new Blob([data], { type: "text/plain" });
              let a = document.createElement("a"),
                url = URL.createObjectURL(file);
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }, 0);
            }}
          />
        </div>
        <div>
          <h3 className="headline--sm">Export my codename</h3>
          <Export
            onClick={() => {
              setModalView("EXPORT_CODENAME");
              openModal();
            }}
          />
        </div>
      </div>
      <div className={s.links}>
        <a
          href="https://www.speakeasy.tech/how-it-works/"
          target="_blank"
          rel="noopener noreferrer"
        >
          About
        </a>
        |
        <a
          href="https://www.speakeasy.tech/roadmap/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Roadmap
        </a>
        |
        <a href="https://xx.network/" target="_blank" rel="noopener noreferrer">
          xx network
        </a>
        |
        <a
          href="https://www.speakeasy.tech/privacy-policy/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        |
        <a
          href="https://www.speakeasy.tech/terms-of-use/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Use
        </a>
      </div>
    </div>
  );
};

export default SettingsView;
