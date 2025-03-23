
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LocationsList = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Locations Management</h2>
        <p className="text-muted-foreground">
          View and manage all locations on the platform.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Locations List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            Locations management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationsList;
