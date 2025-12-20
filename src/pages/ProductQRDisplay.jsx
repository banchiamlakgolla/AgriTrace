import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import QRGenerator from '../components/qr/QRGenerator';
import { collection, query, where, getDocs } from 'firebase/firestore'; // ADD THIS IMPORT

const ProductQRDisplay = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Try querying by product ID field
          const q = query(collection(db, 'products'), where('id', '==', productId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const productData = querySnapshot.docs[0].data();
            setProduct({ id: querySnapshot.docs[0].id, ...productData });
          } else {
            console.error('Product not found');
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product QR Code</h1>
          <p className="text-gray-600">Scan this QR code to verify product authenticity</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <QRGenerator product={product} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Product Name:</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Product ID:</span>
                <span className="font-mono">{product.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Farmer:</span>
                <span className="font-medium">{product.farmerName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Origin:</span>
                <span className="font-medium">{product.origin}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Harvest Date:</span>
                <span className="font-medium">{product.harvestDate}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-bold text-gray-700 mb-2">Instructions:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                <li>Print this QR code and attach it to your product packaging</li>
                <li>Consumers can scan it with any smartphone camera</li>
                <li>They will see the complete product journey</li>
                <li>Authenticity is verified through our blockchain system</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQRDisplay;