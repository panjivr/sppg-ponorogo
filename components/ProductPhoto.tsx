"use client";
import Image from "next/image";
import { useState } from "react";
import Icon from "@/components/Icon";
export default function ProductPhoto({
  nama,
  src,
  priority = false,
  sizes = "(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 280px",
}: {
  nama: string;
  src?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`product-photo ${src && !failed ? "has-photo" : ""}`}>
      {src && !failed ? (
        <Image
          src={src}
          alt={nama}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="product-photo-placeholder"
          aria-label={`Foto ${nama} belum tersedia`}
          role="img"
        >
          <Icon name="leaf" />
          <span>{nama}</span>
        </span>
      )}
    </div>
  );
}
