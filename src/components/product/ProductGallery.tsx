import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface ProductGalleryProps {
  images: string[];
  name: string;
  subcategory: string;
  available: boolean;
}

export const ProductGallery = ({ images, name, subcategory, available }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative">
        <img 
          src={images[selectedImage] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg'} 
          alt={name}
          className="w-full h-96 object-cover rounded-lg shadow-lg"
        />
        <div className="absolute top-4 left-4 space-y-2">
          <Badge variant="outline" className="bg-white">
            {subcategory}
          </Badge>
          {available && (
            <Badge className="bg-green-100 text-green-800">
              В наличии
            </Badge>
          )}
        </div>
      </div>

      {/* Thumbnail Images */}
      <div className="flex space-x-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
              selectedImage === index ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <img 
              src={image} 
              alt={`${name} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};