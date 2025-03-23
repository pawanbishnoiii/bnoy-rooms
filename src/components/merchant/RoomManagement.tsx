
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Bed, Home, Loader2, PlusCircle, RefreshCw, SquarePen, Trash2 } from 'lucide-react';

interface Room {
  id: string;
  property_id: string;
  room_number: string;
  capacity: number;
  occupied_beds: number;
  monthly_price: number;
  daily_price: number | null;
  description: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  images?: RoomImage[];
}

interface RoomImage {
  id: string;
  room_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

interface RoomManagementProps {
  propertyId: string;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ propertyId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    room_number: '',
    capacity: '1',
    monthly_price: '',
    daily_price: '',
    description: '',
    is_available: 'true'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (propertyId) {
      fetchRooms();
    }
  }, [propertyId]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          images:room_images(*)
        `)
        .eq('property_id', propertyId)
        .order('room_number', { ascending: true });

      if (error) {
        throw error;
      }

      setRooms(data || []);
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rooms. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      room_number: '',
      capacity: '1',
      monthly_price: '',
      daily_price: '',
      description: '',
      is_available: 'true'
    });
    setFormError(null);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (room: Room) => {
    setCurrentRoom(room);
    setFormData({
      room_number: room.room_number,
      capacity: String(room.capacity),
      monthly_price: String(room.monthly_price),
      daily_price: room.daily_price ? String(room.daily_price) : '',
      description: room.description || '',
      is_available: room.is_available ? 'true' : 'false'
    });
    setShowEditDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.room_number.trim()) {
      setFormError('Room number is required');
      return false;
    }
    if (!formData.monthly_price || parseInt(formData.monthly_price) <= 0) {
      setFormError('Please enter a valid monthly price');
      return false;
    }
    if (formData.daily_price && parseInt(formData.daily_price) <= 0) {
      setFormError('Daily price should be a positive number');
      return false;
    }
    if (parseInt(formData.capacity) <= 0) {
      setFormError('Capacity should be at least 1');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleAddRoom = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newRoom = {
        property_id: propertyId,
        room_number: formData.room_number,
        capacity: parseInt(formData.capacity),
        monthly_price: parseInt(formData.monthly_price),
        daily_price: formData.daily_price ? parseInt(formData.daily_price) : null,
        description: formData.description || null,
        is_available: formData.is_available === 'true',
        occupied_beds: 0
      };

      const { data, error } = await supabase
        .from('rooms')
        .insert(newRoom)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setRooms([...rooms, data]);
      toast({
        title: 'Success',
        description: 'Room added successfully',
      });
      setShowAddDialog(false);
      resetForm();
    } catch (error: any) {
      console.error('Error adding room:', error);
      setFormError(error.message || 'Failed to add room');
      toast({
        title: 'Error',
        description: error.message || 'Failed to add room',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!currentRoom || !validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatedRoom = {
        room_number: formData.room_number,
        capacity: parseInt(formData.capacity),
        monthly_price: parseInt(formData.monthly_price),
        daily_price: formData.daily_price ? parseInt(formData.daily_price) : null,
        description: formData.description || null,
        is_available: formData.is_available === 'true'
      };

      const { error } = await supabase
        .from('rooms')
        .update(updatedRoom)
        .eq('id', currentRoom.id);

      if (error) {
        throw error;
      }

      setRooms(rooms.map(room => 
        room.id === currentRoom.id 
          ? { ...room, ...updatedRoom }
          : room
      ));
      
      toast({
        title: 'Success',
        description: 'Room updated successfully',
      });
      
      setShowEditDialog(false);
      setCurrentRoom(null);
      resetForm();
    } catch (error: any) {
      console.error('Error updating room:', error);
      setFormError(error.message || 'Failed to update room');
      toast({
        title: 'Error',
        description: error.message || 'Failed to update room',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        throw error;
      }

      setRooms(rooms.filter(room => room.id !== roomId));
      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete room',
        variant: 'destructive'
      });
    }
  };

  const toggleAvailability = async (roomId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ is_available: !currentStatus })
        .eq('id', roomId);

      if (error) {
        throw error;
      }

      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { ...room, is_available: !currentStatus }
          : room
      ));
      
      toast({
        title: 'Success',
        description: `Room ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating room availability:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update room availability',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Room Management</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRooms}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={openAddDialog}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableCaption>
                  {isLoading 
                    ? 'Loading rooms...' 
                    : rooms.length === 0 
                    ? 'No rooms found. Add a room to get started.'
                    : `Showing ${rooms.length} room${rooms.length !== 1 ? 's' : ''}`
                  }
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Pricing (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        <Home className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No rooms found. Add a room to get started.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.room_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{room.capacity} {room.capacity > 1 ? 'beds' : 'bed'}</span>
                            {room.occupied_beds > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {room.occupied_beds}/{room.capacity} occupied
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">₹{room.monthly_price}/month</div>
                            {room.daily_price && (
                              <div className="text-sm text-muted-foreground">₹{room.daily_price}/day</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={room.is_available ? "outline" : "secondary"}>
                            {room.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => toggleAvailability(room.id, room.is_available)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openEditDialog(room)}
                            >
                              <SquarePen className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDeleteRoom(room.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="grid">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rooms.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No rooms found</h3>
                <p className="text-muted-foreground mb-4">Add your first room to start managing your property.</p>
                <Button onClick={openAddDialog}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                      <Badge variant={room.is_available ? "outline" : "secondary"}>
                        {room.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {room.capacity} {room.capacity > 1 ? 'beds' : 'bed'} 
                      {room.occupied_beds > 0 && (
                        <span className="ml-2">
                          ({room.occupied_beds}/{room.capacity} occupied)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div>
                        <div className="font-medium">₹{room.monthly_price}/month</div>
                        {room.daily_price && (
                          <div className="text-sm text-muted-foreground">₹{room.daily_price}/day</div>
                        )}
                      </div>
                      
                      {room.description && (
                        <div className="text-sm text-muted-foreground">
                          {room.description}
                        </div>
                      )}
                      
                      <div className="pt-2 flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleAvailability(room.id, room.is_available)}
                        >
                          {room.is_available ? 'Mark Unavailable' : 'Mark Available'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openEditDialog(room)}
                        >
                          <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Room Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Add a new room to your property. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_number">Room Number *</Label>
                <Input 
                  id="room_number" 
                  name="room_number" 
                  value={formData.room_number}
                  onChange={handleInputChange}
                  placeholder="e.g. 101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity (beds) *</Label>
                <Select 
                  value={formData.capacity} 
                  onValueChange={(value) => handleSelectChange('capacity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 bed</SelectItem>
                    <SelectItem value="2">2 beds</SelectItem>
                    <SelectItem value="3">3 beds</SelectItem>
                    <SelectItem value="4">4 beds</SelectItem>
                    <SelectItem value="5">5 beds</SelectItem>
                    <SelectItem value="6">6 beds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly_price">Monthly Price (₹) *</Label>
                <Input 
                  id="monthly_price" 
                  name="monthly_price" 
                  type="number"
                  value={formData.monthly_price}
                  onChange={handleInputChange}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="daily_price">Daily Price (₹)</Label>
                <Input 
                  id="daily_price" 
                  name="daily_price" 
                  type="number"
                  value={formData.daily_price}
                  onChange={handleInputChange}
                  placeholder="e.g. 250"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Any additional details about the room"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="is_available">Availability Status</Label>
              <Select 
                value={formData.is_available} 
                onValueChange={(value) => handleSelectChange('is_available', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddRoom} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Room'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update the details for room {currentRoom?.room_number}.
            </DialogDescription>
          </DialogHeader>
          
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_room_number">Room Number *</Label>
                <Input 
                  id="edit_room_number" 
                  name="room_number" 
                  value={formData.room_number}
                  onChange={handleInputChange}
                  placeholder="e.g. 101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_capacity">Capacity (beds) *</Label>
                <Select 
                  value={formData.capacity} 
                  onValueChange={(value) => handleSelectChange('capacity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 bed</SelectItem>
                    <SelectItem value="2">2 beds</SelectItem>
                    <SelectItem value="3">3 beds</SelectItem>
                    <SelectItem value="4">4 beds</SelectItem>
                    <SelectItem value="5">5 beds</SelectItem>
                    <SelectItem value="6">6 beds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_monthly_price">Monthly Price (₹) *</Label>
                <Input 
                  id="edit_monthly_price" 
                  name="monthly_price" 
                  type="number"
                  value={formData.monthly_price}
                  onChange={handleInputChange}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_daily_price">Daily Price (₹)</Label>
                <Input 
                  id="edit_daily_price" 
                  name="daily_price" 
                  type="number"
                  value={formData.daily_price}
                  onChange={handleInputChange}
                  placeholder="e.g. 250"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea 
                id="edit_description" 
                name="description" 
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Any additional details about the room"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_is_available">Availability Status</Label>
              <Select 
                value={formData.is_available} 
                onValueChange={(value) => handleSelectChange('is_available', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRoom} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Room'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
