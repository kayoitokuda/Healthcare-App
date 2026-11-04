import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { translateText, useAppLanguage } from "../i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PWAInstallPrompt() {
  const { language } = useAppLanguage();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [visible, setVisible] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    if (isStandalone()) return;
    setVisible(true);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || (!ios && !installEvent)) return null;

  const t = (copy: string) => translateText(copy, language);
  const install = async () => {
    if (ios) {
      setShowIOSHelp((current) => !current);
      return;
    }
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") setVisible(false);
  };

  return (
    <aside className="pwa-install" aria-label={t("Install Referral Navigator")}>
      <div className="pwa-install-copy">
        <span className="pwa-install-icon" aria-hidden="true">
          {ios ? <Share size={17} /> : <Download size={17} />}
        </span>
        <span>
          <strong>{t("Use Referral Navigator like an app")}</strong>
          <small>{t("Add it to your home screen for quick access.")}</small>
        </span>
      </div>
      <div className="pwa-install-actions">
        <button type="button" className="pwa-install-button" onClick={() => void install()}>
          {t(ios ? "How to add" : "Install")}
        </button>
        <button
          type="button"
          className="pwa-install-dismiss"
          aria-label={t("Dismiss install option")}
          onClick={() => setVisible(false)}
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>
      {ios && showIOSHelp && (
        <p className="pwa-install-help" role="status">
          {t("In Safari, tap Share, then Add to Home Screen.")}
        </p>
      )}
    </aside>
  );
}
