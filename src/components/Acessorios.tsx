    import React from 'react';

    interface Accessory {
      id: string;
      title: string;
      description: string;
      imageUrl: string;
      bgColor: string;
    }

    const AccessoriesGallery: React.FC = () => {
      const accessories: Accessory[] = [
        {
          id: 'watch',
          title: 'Premium Watch',
          description: 'Stainless steel luxury timepiece',
          imageUrl: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          bgColor: 'bg-[#5B4C41]'
        },
        {
          id: 'smart-devices',
          title: 'Smart Home Devices',
          description: 'Connected IoT ecosystem',
          imageUrl: 'https://images.unsplash.com/photo-1558089687-f282ffcbc0d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          bgColor: 'bg-[#F1F1F1]'
        },
        {
          id: 'smart-speaker',
          title: 'Voice Assistant',
          description: 'Smart speaker with voice control',
          imageUrl: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          bgColor: 'bg-[#CCCCCC]'
        },
        {
          id: 'soundcore',
          title: 'Soundcore Speaker',
          description: 'Premium Bluetooth audio experience',
          imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          bgColor: 'bg-[#1B1B1B]'
        }
      ];

      const handleCardClick = (productId: string): void => {
        console.log(`Viewing ${productId} details`);
        // Adicione sua lógica de navegação ou modal aqui, por exemplo:
        // navigate(`/product/${productId}`);
      };

      return (
        <section className="bg-black py-16 px-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-28 ">
              Try our other Accessories
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accessories.map((accessory) => (
                <div 
                  key={accessory.id}
                  className="bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/50 cursor-pointer"
                  onClick={() => handleCardClick(accessory.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick(accessory.id)}
                >
                  <div className={`relative h-60 ${accessory.bgColor}`}>
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${accessory.imageUrl})` }}
                    >
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-blue-500/80 text-white px-4 py-2 rounded text-sm font-medium">
                          View Details
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-white">{accessory.title}</h3>
                    <p className="text-sm text-gray-400">{accessory.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    };

    export default AccessoriesGallery;
    