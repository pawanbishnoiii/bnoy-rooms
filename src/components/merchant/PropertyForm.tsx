
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyCategory, GenderOption, Location } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MapPin, Plus, PlusCircle, Upload, X } from 'lucide-react';

const propertyTypes = [
  'Apartment',
  'House',
  'Villa',
  'Bungalow',
  'Studio',
  'Flat',
  'Other'
];

const genderOptions: { value: GenderOption; label: string }[] = [
  { value: 'boys', label: 'Boys Only' },
  { value: 'girls', label: 'Girls Only' },
  { value: 'common', label: 'Co-ed / Mixed' }
];

const PropertyForm = ({ propertyId }: { propertyId?: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isEditing, setIsEditing] = useState(!!propertyId);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Apartment',
    category: 'pg' as PropertyCategory,
    gender: 'common' as GenderOption,
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    daily_price: '',
    monthly_price: '',
    location_id: ''
  });

  // Categories from the initial onboarding component
  const propertyCategories = [
    { id: 'pg', label: 'PG/Co-living' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'dormitory', label: 'Dormitory' },
    { id: 'independent_room', label: 'Independent Room' },
    { id: 'hotel', label: 'Hotel' },
    { id: 'library', label: 'Library' },
    { id: 'coaching', label: 'Coaching Center' },
    { id: 'tiffin_delivery', label: 'Tiffin Delivery' },
  ];

  useEffect(() => {
    fetchLocations();
    if (propertyId) {
      fetchPropertyData();
    }
  }, [propertyId]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load locations. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchPropertyData = async () => {
    if (!propertyId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, images:property_images(*)')
        .eq('id', propertyId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          type: data.type || 'Apartment',
          category: data.category || 'pg',
          gender: data.gender || 'common',
          description: data.description || '',
          address: data.address || '',
          latitude: data.latitude ? String(data.latitude) : '',
          longitude: data.longitude ? String(data.longitude) : '',
          daily_price: data.daily_price ? String(data.daily_price) : '',
          monthly_price: data.monthly_price ? String(data.monthly_price) : '',
          location_id: data.location_id || ''
        });

        if (data.images && Array.isArray(data.images)) {
          setExistingImages(
            data.images.map((img: any) => ({
              id: img.id,
              url: img.image_url
            }))
          );
        }
      }
    } catch (error: any) {
      console.error('Error fetching property data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removePreviewImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const uploadImages = async (propertyId: string): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}.${fileExt}`;
        const filePath = `property_images/${fileName}`;

        // Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);

          // Add image to property_images table
          const { error: insertError } = await supabase
            .from('property_images')
            .insert({
              property_id: propertyId,
              image_url: publicUrlData.publicUrl,
              is_primary: i === 0 && existingImages.length === 0 // First image is primary if no existing images
            });

          if (insertError) throw insertError;
        }
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive'
      });
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to continue',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const propertyData = {
        merchant_id: user.id,
        name: formData.name,
        type: formData.type,
        category: formData.category,
        gender: formData.gender,
        description: formData.description,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        daily_price: formData.daily_price ? parseInt(formData.daily_price) : null,
        monthly_price: parseInt(formData.monthly_price),
        location_id: formData.location_id || null
      };
      
      let newPropertyId: string;
      
      if (isEditing && propertyId) {
        // Update existing property
        const { data, error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', propertyId)
          .select()
          .single();
          
        if (error) throw error;
        newPropertyId = data.id;
        
        toast({
          title: 'Success',
          description: 'Property updated successfully',
        });
      } else {
        // Create new property
        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();
          
        if (error) throw error;
        newPropertyId = data.id;
        
        toast({
          title: 'Success',
          description: 'Property created successfully',
        });
      }
      
      // Upload images if any
      if (imageFiles.length > 0) {
        await uploadImages(newPropertyId);
      }
      
      // Navigate to property detail or back to properties list
      navigate(`/merchant/properties/${newPropertyId}`);
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save property. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading property data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update the information for your existing property' 
              : 'Fill out the details to list your new property on our platform'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
              <TabsTrigger value="details">Basic Details</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter a descriptive name for your property"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Property Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type">Property Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender Policy *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Describe your property, including amenities and special features"
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="monthly_price">Monthly Price (₹) *</Label>
                    <Input
                      id="monthly_price"
                      name="monthly_price"
                      type="number"
                      value={formData.monthly_price}
                      onChange={handleInputChange}
                      placeholder="Monthly rent amount"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="daily_price">Daily Price (₹)</Label>
                    <Input
                      id="daily_price"
                      name="daily_price"
                      type="number"
                      value={formData.daily_price}
                      onChange={handleInputChange}
                      placeholder="Daily rent amount (if applicable)"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location_id">Select Location</Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => handleSelectChange('location_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area or location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- None --</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingLocations && <p className="text-sm text-muted-foreground">Loading locations...</p>}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter the complete address of your property"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="Latitude coordinate"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="Longitude coordinate"
                    />
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" /> 
                  Providing exact coordinates helps users find your property more easily
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Property Images</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label htmlFor="images" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Click to upload images</span>
                      <span className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max 5MB each)</span>
                    </Label>
                  </div>
                </div>
                
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <Label>Existing Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative group border rounded-md overflow-hidden">
                          <img
                            src={image.url}
                            alt="Property"
                            className="h-32 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 opacity-70 hover:opacity-100 transition"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {previewUrls.length > 0 && (
                  <div className="space-y-2">
                    <Label>New Images Preview</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group border rounded-md overflow-hidden">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-32 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePreviewImage(index)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 opacity-70 hover:opacity-100 transition"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/merchant/properties')}
        >
          Cancel
        </Button>
        
        <Button type="submit" disabled={loading || uploadingImages}>
          {loading || uploadingImages ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadingImages ? 'Uploading Images...' : 'Saving...'}
            </>
          ) : (
            <>{isEditing ? 'Update Property' : 'Create Property'}</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
