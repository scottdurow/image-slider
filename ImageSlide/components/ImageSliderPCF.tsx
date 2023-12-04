import React = require("react");
import Lightbox from "yet-another-react-lightbox";
import { Fullscreen, Inline, Slideshow, Thumbnails, Zoom, Captions } from "yet-another-react-lightbox/plugins";


export interface ISliderPhoto {
  src: string;
  title: string;
}

export interface ImageSliderProps {
  images: ISliderPhoto[]
}

const inline = {
  style: {
    width: "100%",
    maxWidth: "900px",
    aspectRatio: "3 / 2",
    margin: "0 auto",
  },
};

export const ImageSlider = ({ images }: ImageSliderProps) => {
  return (
    <Lightbox
      slides={images}
      inline={inline}
      plugins={[Inline, Fullscreen, Slideshow, Thumbnails, Zoom, Captions]}
    />
  );
}
