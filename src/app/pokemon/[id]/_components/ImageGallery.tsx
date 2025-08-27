"use client";
import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { SpriteImage } from "@/constants/pokemon";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// 갤러리 메인 컴포넌트
export const ImageGallery = ({ images }: { images: SpriteImage[] }) => {
  return (
    <ScrollArea className="poke-details-gallery__scroll">
      <div className="poke-details-gallery">
        {images.map((image) => (
          <ImageCard key={`${image.name}-${image.url}`} image={image} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

// card 컴포넌트
function ImageCard({ image }: { image: SpriteImage }) {
  return (
    <Dialog>
      {/* Dialog 트리거 */}
      <DialogTrigger asChild>
        <Card className="poke-details-gallery__card">
          <Image
            width={96}
            height={96}
            src={image.url}
            alt={`${image.name} sprite`}
            unoptimized
          />
        </Card>
      </DialogTrigger>

      {/* Dialog 컨텐츠 */}
      <DialogContent className="poke-details-dialog">
        <DialogHeader>
          <DialogTitle className="poke-details-dialog__name">
            {image.name}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="poke-details-dialog__img">
          <Image
            fill={true}
            src={image.url}
            alt={`${image.name} 확대 이미지`}
            unoptimized
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
