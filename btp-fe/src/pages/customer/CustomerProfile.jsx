import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import useCustomQuery from '@/hooks/useCustomQuery';
import useCustomMutation from '@/hooks/useCustomMutation';
import { customerApi } from '@/api/customerApi';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Calendar as CalendarIcon, Edit2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CustomerProfile = () => {
  const { userId } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch customer data
  const { data: customerData, isLoading, refetch } = useCustomQuery(
    ['customer', userId],
    () => customerApi.getCustomerById(userId),
    {
      enabled: !!userId,
    }
  );

  // Update customer mutation
  const updateMutation = useCustomMutation(
    (data) => customerApi.updateCustomer(userId, data),
    'PUT',
    {
      onSuccess: () => {
        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
        refetch();
      },
    }
  );

  const customer = customerData;

  // Initialize edit data when entering edit mode
  const handleEditClick = () => {
    setEditedData({
      fullName: customer?.fullName || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      dateOfBirth: customer?.dateOfBirth || '',
      gender: customer?.gender || 'MALE',
      profileImage: customer?.profileImage || '',
    });
    if (customer?.dateOfBirth) {
      setSelectedDate(new Date(customer.dateOfBirth));
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
    setSelectedDate(null);
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Validate phone number
    const phoneRegex = /^(\+84|84|0)[35789]\d{8}$/;
    if (editedData.phone && !phoneRegex.test(editedData.phone)) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    // Prepare data for update
    const updateData = {
      ...editedData,
      dateOfBirth: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : editedData.dateOfBirth,
    };

    updateMutation.mutate(updateData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Không tìm thấy thông tin khách hàng</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
        </div>
        {!isEditing && (
          <Button onClick={handleEditClick}>
            <Edit2 className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Thông tin cơ bản và chi tiết về tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={customer.profileImage} alt={customer.fullName} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(customer.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{customer.fullName}</h3>
                  <p className="text-muted-foreground">{customer.email}</p>
                  <Badge variant="outline" className="mt-2">
                    <User className="w-3 h-3 mr-1" />
                    Khách hàng
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Tên đăng nhập
                  </Label>
                  <Input value={customer.username} disabled className="bg-muted" />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input value={customer.email} disabled className="bg-muted" />
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    value={isEditing ? editedData.fullName : customer.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    value={isEditing ? editedData.phone : customer.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="0912345678"
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ
                  </Label>
                  <Input
                    id="address"
                    value={isEditing ? editedData.address : customer.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nhập địa chỉ của bạn"
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Ngày sinh
                  </Label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !selectedDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Chọn ngày sinh'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          captionLayout="dropdown-months"
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          defaultMonth={selectedDate || new Date(2000, 0)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input
                      value={
                        customer.dateOfBirth
                          ? format(new Date(customer.dateOfBirth), 'dd/MM/yyyy')
                          : 'Chưa cập nhật'
                      }
                      disabled
                      className="bg-muted"
                    />
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  {isEditing ? (
                    <Select
                      value={editedData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={
                        customer.gender === 'MALE'
                          ? 'Nam'
                          : customer.gender === 'FEMALE'
                          ? 'Nữ'
                          : 'Khác'
                      }
                      disabled
                      className="bg-muted"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
              <CardDescription>
                Quản lý mật khẩu và các thiết lập bảo mật
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mật khẩu</Label>
                <div className="flex gap-2">
                  <Input type="password" value="••••••••" disabled className="bg-muted" />
                  <Button variant="outline">Đổi mật khẩu</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Xác thực hai yếu tố</h4>
                <p className="text-sm text-muted-foreground">
                  Tăng cường bảo mật tài khoản bằng cách bật xác thực hai yếu tố
                </p>
                <Button variant="outline">Bật xác thực 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerProfile;

