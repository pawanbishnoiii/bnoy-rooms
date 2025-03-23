
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MerchantPropertiesListProps {
  onSelectProperty: (propertyId: string) => void;
}

const MerchantPropertiesList: React.FC<MerchantPropertiesListProps> = ({ onSelectProperty }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Properties</h2>
        <p className="text-muted-foreground">
          View and manage your property listings.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Properties List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            Property management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantPropertiesList;
