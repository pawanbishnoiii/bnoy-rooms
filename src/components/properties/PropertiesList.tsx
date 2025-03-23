
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PropertiesList = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Properties Management</h2>
        <p className="text-muted-foreground">
          View and manage all properties on the platform.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Properties List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            Properties management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertiesList;
