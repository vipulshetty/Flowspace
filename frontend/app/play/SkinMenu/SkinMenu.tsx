import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal/Modal";
import { useModal } from "@/app/hooks/useModal";
import AnimatedCharacter from "./AnimatedCharacter";
import { ArrowFatLeft, ArrowFatRight } from "@phosphor-icons/react";
import BasicLoadingButton from "@/components/BasicLoadingButton";
import {
  selectableSkins,
  defaultSkin,
  getSkinDefinition,
  getSkinPreview,
  resolveSkinId,
} from "@/utils/pixi/Player/skins";
import signal from "@/utils/signal";
import { createClient } from "@/utils/auth/client";
import revalidate from "@/utils/revalidate";
import { toast } from "react-toastify";

type SkinMenuProps = {};

const SkinMenu: React.FC<SkinMenuProps> = () => {
  const { modal, setModal } = useModal();

  const [skinIndex, setSkinIndex] = useState<number>(() => {
    const index = selectableSkins.indexOf(defaultSkin);
    return index === -1 ? 0 : index;
  });
  const [loading, setLoading] = useState(false);

  const authClient = createClient();

  function decrement() {
    setSkinIndex((prevIndex) => (prevIndex - 1 + selectableSkins.length) % selectableSkins.length);
  }

  function increment() {
    setSkinIndex((prevIndex) => (prevIndex + 1) % selectableSkins.length);
  }

  useEffect(() => {
    const onGotSkin = (skin: string) => {
      const normalized = resolveSkinId(skin);
      const index = selectableSkins.indexOf(normalized);
      setSkinIndex(index === -1 ? 0 : index);
    };

    signal.on("skin", onGotSkin);

    return () => {
      signal.off("skin", onGotSkin);
    };
  }, []);

  async function switchSkins() {
  const newSkin = selectableSkins[skinIndex];
    // update user skin via backend API
    const {
      data: { session },
    } = await authClient.getSession();
    if (!session) return;

    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(`${BACKEND_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to update skin");
        return;
      }

      const userData = await response.json();
      // Update skin by updating user profile
      // For now, emit the skin change - backend will need a user update endpoint
      signal.emit("switchSkin", newSkin);

      revalidate("/play/[id]");
      setModal("None");
    } catch (error: any) {
      toast.error(error.message || "Failed to update skin");
    }
  }

  async function handleSwitchSkinsClick() {
    setLoading(true);
    await switchSkins();
    setLoading(false);
  }

  const activeSkinId = selectableSkins[skinIndex] ?? defaultSkin;
  const preview = getSkinPreview(activeSkinId);
  const activeDefinition = getSkinDefinition(activeSkinId);

  return (
    <Modal open={modal === "Skin"} closeOnOutsideClick>
      <div className="w-96 h-96 flex flex-col items-center justify-between pt-8">
        <p>
          {skinIndex + 1} / {selectableSkins.length}
        </p>
        <AnimatedCharacter
          src={preview.src}
          className="w-36"
          noAnimation={!preview.animated}
          isSpriteSheet={preview.animated}
        />
        <p className="text-lg font-semibold text-white">
          {activeDefinition.label}
        </p>
        <div className="flex flex-row items-center justify-center gap-4 mb-12">
          <button
            className="hover:bg-light-secondary animate-colors aspect-square grid place-items-center rounded-lg p-1 outline-none"
            onClick={decrement}
          >
            <ArrowFatLeft className="h-12 w-12" />
          </button>
          <BasicLoadingButton
            onClick={handleSwitchSkinsClick}
            loading={loading}
          >
            Switch
          </BasicLoadingButton>
          <button
            className="hover:bg-light-secondary animate-colors aspect-square grid place-items-center rounded-lg p-1 outline-none"
            onClick={increment}
          >
            <ArrowFatRight className="h-12 w-12" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SkinMenu;
