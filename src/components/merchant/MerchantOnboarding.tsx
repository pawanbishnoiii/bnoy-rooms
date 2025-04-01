
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { toast } from '../ui/use-toast';
import { Steps } from '@/components/ui/steps';
import { Building, User, MapPin, Upload } from 'lucide-react';

const MerchantOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      logo: e.target.files[0],
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit to backend
    toast({
      title: 'Registration Successful',
      description: 'Your merchant account has been created and is pending approval.',
    });
  };

  const steps = [
    {
      title: 'Business Details',
      description: 'Enter your business information',
      icon: <Building size={16} />,
    },
    {
      title: 'Contact Information',
      description: 'Provide contact details',
      icon: <User size={16} />,
    },
    {
      title: 'Location',
      description: 'Enter your address',
      icon: <MapPin size={16} />,
    },
    {
      title: 'Upload',
      description: 'Upload business documents',
      icon: <Upload size={16} />,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                />
              </div>
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your business and services"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={nextStep}>Next</Button>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person's name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter contact phone number"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Previous</Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your business address"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Previous</Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="logo">Business Logo</Label>
                <Input id="logo" type="file" onChange={handleFileChange} />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Previous</Button>
              <Button onClick={handleSubmit}>Submit Application</Button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Merchant Onboarding</CardTitle>
          <CardDescription>Register your business as a merchant on our platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Steps 
            steps={steps}
            currentStep={currentStep}
            className="mb-8"
          />
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantOnboarding;
