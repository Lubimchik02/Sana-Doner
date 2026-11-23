// src/app/page.tsx — главная страница
"use client";

import { useState } from "react";
import { menu, type Dish } from "@/config/brand";
import DemoBanner from "@/components/demo/DemoBanner";
import Hero from "@/components/hero/Hero";
import AnimatedBackground from "@/components/menu/AnimatedBackground";
import StickyNav from "@/components/menu/StickyNav";
import MenuSection from "@/components/menu/MenuSection";
import VariantModal from "@/components/menu/VariantModal";
import CartToast from "@/components/cart/CartToast";
import MobileCartButton from "@/components/cart/MobileCartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import ContactsSection from "@/components/contacts/ContactsSection";
import ReviewModal from "@/components/reviews/ReviewModal";

export default function HomePage() {
  const [variantDish, setVariantDish] = useState<Dish | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <AnimatedBackground />
      <DemoBanner />
      <Hero />

      <div id="menu">
        <StickyNav onCartClick={() => setCartOpen(true)} />
        <MenuSection section={menu.classic} onChooseVariant={setVariantDish} />
        <MenuSection section={menu.healthy} onChooseVariant={setVariantDish} />
      </div>

      <ContactsSection />

      {/* отступ, чтобы плавающая корзина не перекрывала контент */}
      <div className="h-24 md:hidden" />

      <VariantModal dish={variantDish} onClose={() => setVariantDish(null)} />
      <CartToast />
      <MobileCartButton onClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ReviewModal />
    </>
  );
}
