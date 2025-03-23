
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FavoritesList = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Favorites</h2>
        <p className="text-muted-foreground">
          View and manage your saved properties.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Saved Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            Favorites management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoritesList;
