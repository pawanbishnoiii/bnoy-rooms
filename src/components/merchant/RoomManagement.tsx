import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Property, Room } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, Loader2, BedDouble, ImagePlus } from 'lucide-react';

const RoomManagement = ({ propertyId }: { propertyId: string }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    capacity: 1,
    occupied_beds: 0,
    monthly_price: 0,
    daily_price: null as number | null,
    description: '',
    is_available: true
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyAndRooms();
    }
  }, [propertyId]);

  const fetchPropertyAndRooms = async () => {
    setLoading(true);
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*, images:room_images(*)')
        .eq('property_id', propertyId)
        .order('room_number', { ascending: true });

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);
    } catch (error: any) {
      console.error('Error fetching property and rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setCurrentRoom(null);
    setRoomForm({
      room_number: '',
      capacity: 1,
      occupied_beds: 0,
      monthly_price: property?.monthly_price || 0,
      daily_price: property?.daily_price || null,
      description: '',
      is_available: true
    });
    setImageFiles([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (room: Room) => {
    setCurrentRoom(room);
    setRoomForm({
      room_number: room.room_number,
      capacity: room.capacity,
      occupied_beds: room.occupied_beds,
      monthly_price: room.monthly_price,
      daily_price: room.daily_price,
      description: room.description || '',
      is_available: room.is_available
    });
    setImageFiles([]);
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoomForm(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'occupied_beds' || name === 'monthly_price' || name === 'daily_price'
        ? value === '' ? (name === 'daily_price' ? null : 0) : parseInt(value)
        : value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setRoomForm(prev => ({ ...prev, is_available: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setImageFiles(Array.from(files));
  };

  const uploadRoomImages = async (roomId: string): Promise<void> => {
    if (imageFiles.length === 0) return;

    setUploadingImages(true);
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${roomId}/${Date.now()}.${fileExt}`;
        const filePath = `room_images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          const { error: insertError } = await supabase
            .from('room_images')
            .insert({
              room_id: roomId,
              image_url: publicUrlData.publicUrl,
              is_primary: i === 0
            });

          if (insertError) throw insertError;
        }
      }
    } catch (error: any) {
      console.error('Error uploading room images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload room images. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    if (!propertyId) return;

    if (roomForm.occupied_beds > roomForm.capacity) {
      toast({
        title: 'Validation Error',
        description: 'Occupied beds cannot exceed capacity',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const roomData = {
        property_id: propertyId,
        room_number: roomForm.room_number,
        capacity: roomForm.capacity,
        occupied_beds: roomForm.occupied_beds,
        monthly_price: roomForm.monthly_price,
        daily_price: roomForm.daily_price,
        description: roomForm.description,
        is_available: roomForm.is_available
      };

      let savedRoomId: string;

      if (currentRoom) {
        const { data, error } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', currentRoom.id)
          .select()
          .single();

        if (error) throw error;
        savedRoomId = data.id;

        toast({
          title: 'Success',
          description: 'Room updated successfully',
        });
      } else {
        const { data, error } = await supabase
          .from('rooms')
          .insert(roomData)
          .select()
          .single();

        if (error) throw error;
        savedRoomId = data.id;

        toast({
          title: 'Success',
          description: 'Room added successfully',
        });
      }

      if (imageFiles.length > 0) {
        await uploadRoomImages(savedRoomId);
      }

      await fetchPropertyAndRooms();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save room. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      await fetchPropertyAndRooms();
      
      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete room. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading rooms...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Room Management</h2>
          <p className="text-sm text-muted-foreground">Manage individual rooms and beds in your property</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Rooms Added Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add individual rooms to your property to manage bookings and availability more effectively.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Price/Month</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.room_number}</TableCell>
                    <TableCell>{room.capacity} {room.capacity > 1 ? 'beds' : 'bed'}</TableCell>
                    <TableCell>
                      {room.occupied_beds}/{room.capacity} occupied
                    </TableCell>
                    <TableCell>₹{room.monthly_price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={room.is_available ? "default" : "secondary"}>
                        {room.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the room
                                and all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRoom(room.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {currentRoom
                ? 'Update details for this room'
                : 'Add a new room to your property'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room_number">Room Number/Name *</Label>
              <Input
                id="room_number"
                name="room_number"
                value={roomForm.room_number}
                onChange={handleInputChange}
                placeholder="e.g. 101, A1, etc."
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacity">Total Capacity *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={roomForm.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="occupied_beds">Occupied Beds</Label>
                <Input
                  id="occupied_beds"
                  name="occupied_beds"
                  type="number"
                  min="0"
                  max={roomForm.capacity}
                  value={roomForm.occupied_beds}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="monthly_price">Monthly Price (₹) *</Label>
                <Input
                  id="monthly_price"
                  name="monthly_price"
                  type="number"
                  min="0"
                  value={roomForm.monthly_price || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="daily_price">Daily Price (₹)</Label>
                <Input
                  id="daily_price"
                  name="daily_price"
                  type="number"
                  min="0"
                  value={roomForm.daily_price || ''}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Room Description</Label>
              <Textarea
                id="description"
                name="description"
                value={roomForm.description}
                onChange={handleInputChange}
                placeholder="Describe the room, its features, etc."
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="room_images">Room Images</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Input
                  id="room_images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="room_images"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">Upload Room Images</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {imageFiles.length > 0 
                      ? `${imageFiles.length} file(s) selected` 
                      : 'SVG, PNG, JPG or GIF (max 5MB)'}
                  </span>
                </Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="is_available" className="cursor-pointer">
                Room Available for Booking
              </Label>
              <Switch
                id="is_available"
                checked={roomForm.is_available}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Room'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
