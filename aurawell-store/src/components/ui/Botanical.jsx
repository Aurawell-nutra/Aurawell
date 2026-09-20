import Image from "next/image";
import { cn } from "@/lib/utils";

// Decorative leaf artwork from /public/images/decorative.
// Artwork grows from its bottom-left corner — mirror with -scale-x-100 / -scale-y-100
// to anchor it to other corners of a section.
const artwork = {
  fern: { src: "/images/decorative/fern.svg", width: 410, height: 570 },
  eucalyptus: { src: "/images/decorative/eucalyptus.svg", width: 430, height: 530 },
  olive: { src: "/images/decorative/olive-twig.svg", width: 490, height: 350 },
  tropical: { src: "/images/decorative/tropical-leaf.svg", width: 470, height: 510 },
  corner: { src: "/images/decorative/leaves-corner.svg", width: 440, height: 440 },
  sprig: { src: "/images/decorative/leaf-branch.svg", width: 320, height: 520 },
  leaf: { src: "/images/decorative/leaf-single.svg", width: 140, height: 140 },
  leafLight: { src: "/images/decorative/leaf-single-light.svg", width: 140, height: 140 },
};

export default function Botanical({ name, className }) {
  const { src, width, height } = artwork[name];
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      width={width}
      height={height}
      className={cn("pointer-events-none absolute -z-10 h-auto select-none", className)}
    />
  );
}
