
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ReviewsList = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
        <p className="text-muted-foreground">
          View and manage your reviews.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reviews List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            Reviews management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsList;
