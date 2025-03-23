
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MerchantsList = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Merchants Management</h2>
        <p className="text-muted-foreground">
          View and manage all merchants on the platform.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Merchants List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            Merchants management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantsList;
