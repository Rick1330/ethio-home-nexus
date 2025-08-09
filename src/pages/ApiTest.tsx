import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import authService from '@/services/authService';
import propertyService from '@/services/propertyService';
import interestService from '@/services/interestService';
import reviewService from '@/services/reviewService';
import sellingService from '@/services/sellingService';
import subscriptionService from '@/services/subscriptionService';

const ApiTest = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: { status: 'success', data: result } }));
      toast({
        title: `${testName} Test Passed`,
        description: "API endpoint working correctly",
      });
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'error', 
          error: error.response?.data?.message || error.message 
        } 
      }));
      toast({
        title: `${testName} Test Failed`,
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const authTests = [
    {
      name: 'Auth - Get Current User',
      test: () => authService.getCurrentUser(),
    },
  ];

  const propertyTests = [
    {
      name: 'Properties - Get All',
      test: () => propertyService.getProperties(),
    },
    {
      name: 'Properties - Get Stats',
      test: () => propertyService.getPropertyStats(),
    },
  ];

  const interestTests = [
    {
      name: 'Interest - Get My Interests',
      test: () => interestService.getMyInterests(),
    },
  ];

  const reviewTests = [
    {
      name: 'Reviews - Get All',
      test: () => reviewService.getAllReviews(),
    },
  ];

  const sellingTests = [
    {
      name: 'Selling - Get Records',
      test: () => sellingService.getAllSellingRecords(),
    },
    {
      name: 'Selling - Get Stats',
      test: () => sellingService.getSellingStats(),
    },
  ];

  const subscriptionTests = [
    {
      name: 'Subscription - Get Plans',
      test: () => subscriptionService.getSubscriptionPlans(),
    },
  ];

  const renderTestButton = (test: { name: string; test: () => Promise<any> }) => (
    <div key={test.name} className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium">{test.name}</h4>
        {testResults[test.name] && (
          <div className="mt-2">
            <Badge variant={testResults[test.name].status === 'success' ? 'default' : 'destructive'}>
              {testResults[test.name].status}
            </Badge>
            {testResults[test.name].error && (
              <p className="text-sm text-red-600 mt-1">{testResults[test.name].error}</p>
            )}
            {testResults[test.name].data && (
              <pre className="text-xs mt-1 p-2 bg-gray-100 rounded max-h-32 overflow-y-auto">
                {JSON.stringify(testResults[test.name].data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
      <Button 
        onClick={() => runTest(test.name, test.test)}
        disabled={isLoading[test.name]}
        size="sm"
      >
        {isLoading[test.name] ? 'Testing...' : 'Test'}
      </Button>
    </div>
  );

  const runAllTests = async () => {
    const allTests = [
      ...authTests,
      ...propertyTests,
      ...interestTests,
      ...reviewTests,
      ...sellingTests,
      ...subscriptionTests,
    ];
    
    for (const test of allTests) {
      await runTest(test.name, test.test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">API Integration Test Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Test all backend API endpoints to verify integration
        </p>
        <Button onClick={runAllTests} className="mb-6">
          Run All Tests
        </Button>
      </div>

      <Tabs defaultValue="auth" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="interest">Interest</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="selling">Selling</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication API Tests</CardTitle>
              <CardDescription>Test authentication endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authTests.map(renderTestButton)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property API Tests</CardTitle>
              <CardDescription>Test property management endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {propertyTests.map(renderTestButton)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interest Form API Tests</CardTitle>
              <CardDescription>Test interest form endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {interestTests.map(renderTestButton)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review API Tests</CardTitle>
              <CardDescription>Test review system endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewTests.map(renderTestButton)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selling API Tests</CardTitle>
              <CardDescription>Test payment and selling endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sellingTests.map(renderTestButton)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription API Tests</CardTitle>
              <CardDescription>Test subscription management endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionTests.map(renderTestButton)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Current API base URL and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Base URL</Label>
              <p className="text-sm text-muted-foreground">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}
              </p>
            </div>
            <div>
              <Label className="font-medium">With Credentials</Label>
              <p className="text-sm text-muted-foreground">true (HTTP-only cookies)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;