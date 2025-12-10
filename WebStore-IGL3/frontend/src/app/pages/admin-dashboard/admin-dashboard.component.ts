import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { OrderService } from '../../services/order.service';
import { UserService, UserStats } from '../../services/user.service';
import { DashboardEventService } from '../../services/dashboard-event.service';
import { Order, OrderStatus } from '../../models/order.interface';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_USERS } from '../../services/mock-data';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  imports: [SidebarComponent, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboard implements OnInit, OnDestroy {
  latestOrders: Order[] = [];
  loading = true;
  error: string | null = null;
  usingMockData = false;
  
  // Auto-refresh subscription
  private refreshSubscription?: Subscription;
  private eventSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 30000; // 30 seconds

  // Statistics
  stats = {
    pendingOrders: 0,        // Commandes en attente (pas encore validées par l'admin)
    deliveredOrders: 0,      // Commandes livrées (validées par l'admin)
    totalRevenue: 0,
    totalOrders: 0
  };

  // Product Statistics
  productStats = {
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    topSellingProducts: [] as any[]
  };

  // Chart data for dynamic graphs - Initialize with realistic values
  chartData = {
    // Orders over time chart data
    ordersOverTime: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      confirmedOrders: [8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45],
      deliveredOrders: [6, 10, 12, 15, 18, 21, 24, 28, 31, 34, 38, 40],
      currentYear: new Date().getFullYear(),
      maxValue: 50
    },
    // User/client statistics  
    userStats: {
      totalUsers: 156, // More realistic user count for small business
      activeUsers: 89,  // About 57% active users
      userGrowthPercentage: 34, // More realistic growth percentage
      monthlyGrowth: [45, 52, 61, 68, 75, 83, 92, 101, 112, 125, 139, 156] // steady growth
    }
  };

  // Use centralized mock data
  private get mockOrders(): Order[] {
    return MOCK_ORDERS;
  }
  
  private get mockUsers() {
    return MOCK_USERS;
  }
  
  // Enhanced mock data will be generated in methods when needed

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private dashboardEventService: DashboardEventService
  ) {}

  ngOnInit() {
    console.log('🚀 AdminDashboard initializing with mock data only...');
    console.log('📊 Initial mock orders count:', this.mockOrders.length);
    console.log('📈 Initial chart data:', this.chartData);
    
    // Use mock data only (no backend)
    this.initializeWithMockData();
    this.setupEventListeners();
    
    console.log('✅ Dashboard initialized with mock data');
  }

  private initializeWithMockData() {
    console.log('📊 Initializing with mock data...');
    this.usingMockData = true;
    this.loading = false;
    this.error = null;
    
    // Set mock orders
    this.latestOrders = this.mockOrders
      .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5);
    
    // Calculate mock statistics
    this.loadMockStatistics();
    
    // Calculate product statistics
    this.productStats = this.calculateProductStats();
    
    // Load mock chart data
    this.loadMockChartData();
    
    console.log('✅ Mock data initialized:', {
      orders: this.latestOrders.length,
      stats: this.stats,
      usingMock: this.usingMockData
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  private setupEventListeners() {
    // Listen for dashboard events and refresh mock data
    this.eventSubscription = this.dashboardEventService.orderUpdated$.subscribe(() => {
      console.log('🔄 Event received: Refreshing mock data...');
      this.initializeWithMockData();
    });
  }

  private setupAutoRefresh() {
    // Auto-refresh mock data every 30 seconds to simulate dynamic data
    this.refreshSubscription = interval(this.REFRESH_INTERVAL)
      .subscribe(() => {
        console.log('🔄 Auto-refreshing mock data...');
        // Slightly randomize the mock data to simulate changes
        this.updateMockDataWithVariation();
      });
  }

  private updateMockDataWithVariation() {
    // Slightly modify chart data to simulate real-time changes
    this.chartData.ordersOverTime.confirmedOrders = this.chartData.ordersOverTime.confirmedOrders.map(val => {
      const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      return Math.max(0, val + variation);
    });
    
    this.chartData.ordersOverTime.deliveredOrders = this.chartData.ordersOverTime.deliveredOrders.map(val => {
      const variation = Math.floor(Math.random() * 3) - 1;
      return Math.max(0, val + variation);
    });
    
    // Update max value
    this.chartData.ordersOverTime.maxValue = Math.max(
      ...this.chartData.ordersOverTime.confirmedOrders,
      ...this.chartData.ordersOverTime.deliveredOrders
    ) + 5;
    
    console.log('🔄 Mock data updated with variations');
  }

  loadData() {
    console.log('📊 Refreshing mock data...');
    this.initializeWithMockData();
  }

  loadLatestOrders() {
    console.log('📊 Loading orders from mock data only...');
    this.initializeWithMockData();
  }

  loadStatistics() {
    // Always use mock statistics
    this.loadMockStatistics();
  }



  private loadMockStatistics() {
    console.info('📊 Calculating statistics from mock data');
    console.log('📊 Mock orders count:', this.mockOrders.length);
    
    // Calculate statistics from mock data (we now have 8 orders)
    this.stats.totalOrders = this.mockOrders.length;
    this.stats.pendingOrders = this.mockOrders.filter(order => 
      order.status === OrderStatus.PENDING).length;
    this.stats.deliveredOrders = this.mockOrders.filter(order => 
      order.status === OrderStatus.DELIVERED).length;
    
    // Calculate revenue only from delivered orders
    this.stats.totalRevenue = this.mockOrders
      .filter(order => order.status === OrderStatus.DELIVERED)
      .reduce((total, order) => {
        const orderTotal = this.calculateOrderTotal(order);
        console.log(`💰 Delivered Order #${order.id} (${order.user.firstName}) total: ${orderTotal.toFixed(2)} DT`);
        return total + orderTotal;
      }, 0);
      
    console.log('📊 Final calculated stats from 8 orders:', {
      total: this.stats.totalOrders,
      pending: this.stats.pendingOrders, 
      delivered: this.stats.deliveredOrders,
      confirmed: this.mockOrders.filter(order => order.status === OrderStatus.CONFIRMED).length,
      revenue: this.stats.totalRevenue.toFixed(2) + ' DT'
    });
  }

  // Manual refresh function
  refreshData() {
    console.log('🔄 Manual refresh triggered (mock data)');
    this.initializeWithMockData();
  }

  getStatusBadgeColor(status: OrderStatus): string {
    return this.orderService.getStatusColor(status);
  }

  getStatusLabel(status: OrderStatus): string {
    return this.orderService.getStatusLabel(status);
  }

  calculateOrderTotal(order: Order): number {
    // Use the same logic as stats page - calculate from orderItems
    const orderItems = order.orderItems || [];
    return orderItems.reduce((total: number, item: any) => {
      const itemPrice = item.product?.price || item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + (itemPrice * itemQuantity);
    }, 0);
  }

  getTotalQuantity(order: Order): number {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Generate a placeholder avatar URL based on user name
  getAvatarUrl(user: any): string {
    const firstName = user.firstName || 'User';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    // Use a placeholder service or generate initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=8b5cf6&color=fff&size=40`;
  }

  // Format numbers for display
  formatNumber(num: number): string {
    // Handle NaN, undefined, null values
    if (isNaN(num) || num === null || num === undefined) {
      return '0';
    }
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return Math.round(num).toString();
  }

  // Safe percentage formatter
  formatPercentage(percentage: number): string {
    if (isNaN(percentage) || percentage === null || percentage === undefined) {
      return '0';
    }
    return Math.max(0, Math.min(100, Math.round(percentage))).toString();
  }

  // Load dynamic chart data
  loadChartData() {
    this.loadOrdersOverTimeData();
    this.loadUserStatsData();
  }

  // Load orders over time for the chart
  private loadOrdersOverTimeData() {
    try {
      // Try to calculate real data from recent orders
      if (!this.usingMockData) {
        this.calculateOrdersOverTime();
      } else {
        // Use mock chart data
        this.loadMockChartData();
      }
    } catch (error) {
      console.warn('Failed to load chart data, using defaults:', error);
      this.loadMockChartData();
    }
  }

  // Calculate actual orders over time from recent orders
  private calculateOrdersOverTime() {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize arrays for each month
    const confirmedByMonth = new Array(12).fill(0);
    const deliveredByMonth = new Array(12).fill(0);

    console.log('📊 Calculating chart from real order data...');

    // Always fetch all orders for chart calculation (not just the 5 latest ones)
    console.log('📊 Fetching all orders for chart analysis...');
    
    this.orderService.getOrders(0, 1000, 'orderDate', 'desc').subscribe({
      next: (response) => {
        const orders = response.orders || [];
        console.log(`✅ Loaded ${orders.length} orders for chart analysis`);
        this.processOrdersForChart(orders, confirmedByMonth, deliveredByMonth, currentYear, months);
      },
      error: (error) => {
        console.error('❌ Failed to load orders for chart:', error);
        console.warn('🔄 Falling back to mock chart data');
        this.loadMockChartData();
      }
    });
  }

  // Process orders and update chart data
  private processOrdersForChart(orders: any[], confirmedByMonth: number[], deliveredByMonth: number[], currentYear: number, months: string[]) {
    // Debug: Log order details
    const ordersByStatus = {
      confirmed: orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
      delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length
    };
    console.log('📈 Orders by status:', ordersByStatus);

    // Count orders by month for current year only
    let totalCurrentYearOrders = 0;
    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      if (orderDate.getFullYear() === currentYear) {
        const month = orderDate.getMonth();
        totalCurrentYearOrders++;
        
        console.log(`📅 Order ${order.id} from ${orderDate.toDateString()} (${order.status}) -> Month ${month + 1}`);
        
        if (order.status === OrderStatus.CONFIRMED) {
          confirmedByMonth[month]++;
        } else if (order.status === OrderStatus.DELIVERED) {
          deliveredByMonth[month]++;
        }
      }
    });

    console.log(`📊 Found ${totalCurrentYearOrders} orders in ${currentYear}`);
    console.log('📈 Confirmed by month:', confirmedByMonth);
    console.log('📈 Delivered by month:', deliveredByMonth);

    // Update chart data with real values (handle zero case gracefully)
    const maxConfirmed = Math.max(...confirmedByMonth);
    const maxDelivered = Math.max(...deliveredByMonth);
    const maxValue = Math.max(maxConfirmed, maxDelivered, 1) + 1; // At least 2 for scale

    this.chartData.ordersOverTime = {
      months: months,
      confirmedOrders: confirmedByMonth,
      deliveredOrders: deliveredByMonth,
      currentYear: currentYear,
      maxValue: maxValue
    };

    console.log('✅ Chart data updated with real order data:', {
      totalOrdersInYear: totalCurrentYearOrders,
      maxValue: maxValue,
      confirmedTotal: confirmedByMonth.reduce((a, b) => a + b, 0),
      deliveredTotal: deliveredByMonth.reduce((a, b) => a + b, 0)
    });
  }

  // Load user statistics for the member card
  private loadUserStatsData() {
    if (!this.usingMockData) {
      // Try to load real user statistics from backend
      this.userService.getUserStats().subscribe({
        next: (userStats: UserStats) => {
          console.log('✅ Real user statistics loaded:', userStats);
          
          // Validate data and calculate active percentage safely
          const totalUsers = userStats.totalUsers || 0;
          const memberCount = userStats.memberCount || 0;
          
          const memberPercentage = totalUsers > 0 
            ? Math.round((memberCount / totalUsers) * 100)
            : 0; // Safe fallback to 0% if no users

          // Ensure percentage is valid and not NaN
          const validPercentage = isNaN(memberPercentage) ? 0 : Math.max(0, Math.min(100, memberPercentage));

          // Update chart data with real statistics
          this.chartData.userStats = {
            totalUsers: totalUsers,
            activeUsers: memberCount,
            userGrowthPercentage: validPercentage,
            monthlyGrowth: this.generateMonthlyGrowthData(memberCount)
          };

          console.log('📊 User stats updated:', this.chartData.userStats);
        },
        error: (error) => {
          console.warn('Failed to load user statistics from backend, using estimated data:', error);
          this.loadEstimatedUserStats();
        }
      });
    } else {
      // Use mock data when backend is not available
      this.chartData.userStats = {
        totalUsers: 1400,
        activeUsers: 1148, // 82% of 1400
        userGrowthPercentage: 82,
        monthlyGrowth: [20, 25, 30, 28, 35, 40, 38, 42, 45, 48, 50, 52]
      };
    }
  }

  // Fallback method to estimate user stats from order data
  private loadEstimatedUserStats() {
    if (this.latestOrders && this.latestOrders.length > 0) {
      // Count only unique users who have DELIVERED orders (total clients)
      const uniqueDeliveredUsers = new Set(
        this.latestOrders
          .filter(order => order.status === OrderStatus.DELIVERED)
          .map(order => order.user?.id)
          .filter(id => id)
      ).size;

      // Count unique users with any confirmed or delivered order (active users)
      const uniqueActiveUsers = new Set(
        this.latestOrders
          .filter(order => order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.DELIVERED)
          .map(order => order.user?.id)
          .filter(id => id)
      ).size;

      // Calculate percentage based on actual delivered users
      const percentage = uniqueDeliveredUsers > 0 && uniqueActiveUsers > 0
        ? Math.round((uniqueDeliveredUsers / uniqueActiveUsers) * 100)
        : 0;

      this.chartData.userStats = {
        totalUsers: uniqueDeliveredUsers, // Only users with delivered orders
        activeUsers: uniqueActiveUsers, // Users with confirmed/delivered orders
        userGrowthPercentage: percentage,
        monthlyGrowth: this.generateMonthlyGrowthData(uniqueActiveUsers)
      };
      
      console.log('📊 Estimated user stats (delivered only):', {
        totalClients: uniqueDeliveredUsers,
        activeUsers: uniqueActiveUsers,
        percentage: percentage,
        totalOrders: this.latestOrders.length,
        deliveredOrders: this.latestOrders.filter(o => o.status === OrderStatus.DELIVERED).length
      });
    } else {
      // Final fallback to reasonable default values
      this.chartData.userStats = {
        totalUsers: 850,
        activeUsers: 697, // 82% of 850
        userGrowthPercentage: 82,
        monthlyGrowth: [20, 25, 30, 28, 35, 40, 38, 42, 45, 48, 50, 52]
      };
      
      console.log('📊 Using default user stats fallback:', this.chartData.userStats);
    }
  }

  // Generate realistic monthly growth data based on current user count
  private generateMonthlyGrowthData(currentUsers: number): number[] {
    const months = 12;
    const growth = [];
    const baseValue = Math.max(Math.floor(currentUsers / 25), 10); // Base monthly activity
    
    for (let i = 0; i < months; i++) {
      // Add some realistic variation (+/- 20%)
      const variation = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
      const monthlyValue = Math.round(baseValue * (1 + variation + i * 0.05)); // Growth trend over year
      growth.push(Math.max(monthlyValue, 5)); // Minimum of 5
    }
    
    return growth;
  }

  private loadMockChartData() {
    console.warn('🔄 Using enhanced mock chart data as fallback');
    
    // Use the generated realistic data from initialization
    const confirmedData = this.chartData.ordersOverTime.confirmedOrders;
    const deliveredData = this.chartData.ordersOverTime.deliveredOrders;
    
    this.chartData.ordersOverTime = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      confirmedOrders: confirmedData,
      deliveredOrders: deliveredData,
      currentYear: new Date().getFullYear(),
      maxValue: Math.max(...confirmedData, ...deliveredData) + 5
    };
    
    console.log('📊 Enhanced mock chart data loaded:', {
      confirmed: confirmedData,
      delivered: deliveredData,
      maxValue: this.chartData.ordersOverTime.maxValue
    });
  }

  // Generate SVG path for chart lines
  generateChartPath(data: number[], width: number = 500, height: number = 200, maxValue?: number): string {
    if (data.length === 0) return '';
    
    const max = maxValue || Math.max(...data);
    // Utiliser 11 intervalles pour 12 mois (cohérent avec getCurrentMonthX)
    const stepX = width / 11;
    
    let path = '';
    
    data.forEach((value, index) => {
      // Position X sans padding - directement aligné avec les mois
      const x = index * stepX;
      // Position Y inversée - valeurs hautes en haut
      const y = height - (value / max) * height;
      
      if (index === 0) {
        path += `M${x},${y}`;
      } else {
        // Courbes lisses avec bezier quadratique
        const prevX = (index - 1) * stepX;
        const prevY = height - (data[index - 1] / max) * height;
        const controlX = (prevX + x) / 2;
        const controlY = (prevY + y) / 2;
        path += ` Q${controlX},${prevY} ${x},${y}`;
      }
    });
    
    return path;
  }

  // Helper methods for chart positioning (parfaitement synchronisé avec generateChartPath)
  getCurrentMonthX(width: number = 760): number {
    // Même calcul que generateChartPath : mois * (largeur / 11)
    return (new Date().getMonth() * width / 11);
  }

  getCurrentMonthY(height: number = 210): number {
    const currentMonth = new Date().getMonth();
    const value = this.chartData.ordersOverTime.confirmedOrders[currentMonth];
    // Même calcul que generateChartPath : height - (value / max) * height
    return height - (value / this.chartData.ordersOverTime.maxValue) * height;
  }

  getCurrentMonthTextY(height: number = 210): number {
    return this.getCurrentMonthY(height) + 5;
  }

  getCurrentMonthValue(): number {
    return this.chartData.ordersOverTime.confirmedOrders[new Date().getMonth()];
  }

  // Helper methods for user stats chart
  getUserGrowthStartY(): number {
    return 60 - (this.chartData.userStats.monthlyGrowth[0] / 60) * 40;
  }

  getUserGrowthMidY(): number {
    return 60 - (this.chartData.userStats.monthlyGrowth[5] / 60) * 40;
  }

  getUserGrowthEndY(): number {
    return 60 - (this.chartData.userStats.monthlyGrowth[11] / 60) * 40;
  }

  getUserGrowthPercentage(): number {
    const start = this.chartData.userStats.monthlyGrowth[0];
    const end = this.chartData.userStats.monthlyGrowth[11];
    return Math.round(((end - start) / start) * 100);
  }

  // Enhanced data generation methods
  private generateMonthlyOrderData() {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const confirmedOrders = Math.floor(Math.random() * 30) + 15; // 15-45 orders
      const deliveredOrders = Math.floor(confirmedOrders * 0.8) + Math.floor(Math.random() * 5); // 80-90% delivered
      
      data.push({
        month: month.toLocaleDateString('en', { month: 'short' }),
        confirmed: confirmedOrders,
        delivered: deliveredOrders,
        revenue: (confirmedOrders * (Math.random() * 100 + 50)) // Random revenue per order
      });
    }
    
    return data;
  }

  private generateRealisticOrderData(type: 'confirmed' | 'delivered'): number[] {
    const baseData = [15, 23, 18, 31, 28, 35, 42, 38, 45, 39, 41, 48];
    
    if (type === 'delivered') {
      // Delivered orders are typically 80-90% of confirmed orders
      return baseData.map(value => Math.floor(value * (0.8 + Math.random() * 0.1)));
    }
    
    // Add some seasonal variation and growth trend
    return baseData.map((value, index) => {
      const seasonalMultiplier = 1 + 0.2 * Math.sin((index / 12) * 2 * Math.PI); // Seasonal variation
      const growthMultiplier = 1 + (index * 0.05); // 5% growth per month
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% random variation
      
      return Math.round(value * seasonalMultiplier * growthMultiplier * randomVariation);
    });
  }

  private generateUserGrowthData(): number[] {
    // Return the realistic user growth from chartData
    return this.chartData.userStats.monthlyGrowth;
  }

  private calculateProductStats() {
    // Calculate real statistics from MOCK_PRODUCTS
    const stats = {
      topSellingProducts: this.getTopSellingProducts(),
      totalProducts: MOCK_PRODUCTS.length,
      lowStockProducts: MOCK_PRODUCTS.filter(p => p.stock > 0 && p.stock < 20).length,
      outOfStockProducts: MOCK_PRODUCTS.filter(p => p.stock === 0).length
    };
    
    return stats;
  }

  // Enhanced statistics calculation using mock products data
  getTopSellingProducts() {
    // Create realistic top selling products based on our orders
    const topProducts = [
      { id: 1, name: 'StudyZone White T-Shirt', price: 29.99, salesCount: 40, revenue: 1174.53 },
      { id: 2, name: 'StudyZone Classic Black T-Shirt', price: 24.99, salesCount: 39, revenue: 1319.58 },
      { id: 3, name: 'Blue Jeans', price: 149.99, salesCount: 23, revenue: 3439.57 },
      { id: 4, name: 'Black Hoodie', price: 89.99, salesCount: 20, revenue: 1879.67 },
      { id: 5, name: 'StudyZone Navy Hoodie', price: 59.99, salesCount: 19, revenue: 1199.80 }
    ];
    
    return topProducts;
  }

  getLowStockProducts() {
    return MOCK_PRODUCTS.filter(product => product.stock > 0 && product.stock < 20);
  }

  getOutOfStockProducts() {
    return MOCK_PRODUCTS.filter(product => product.stock === 0);
  }

  // Calculate enhanced metrics
  calculateConversionRate(): number {
    const delivered = this.stats.deliveredOrders;
    const total = this.stats.totalOrders;
    return total > 0 ? Math.round((delivered / total) * 100) : 0;
  }

  calculateAverageOrderValue(): number {
    const revenue = this.stats.totalRevenue;
    const orders = this.stats.deliveredOrders;
    return orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0;
  }

  // Format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Calculate monthly revenue growth
  calculateMonthlyGrowth(): number {
    // Simulate month-over-month growth
    const currentMonthRevenue = Math.random() * 5000 + 10000; // 10k-15k TND
    const lastMonthRevenue = Math.random() * 4000 + 8000;     // 8k-12k TND
    
    return Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
  }
}
