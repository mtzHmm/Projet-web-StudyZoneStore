import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { OrderService } from '../../services/order.service';
import { UserService, UserStats } from '../../services/user.service';
import { DashboardEventService } from '../../services/dashboard-event.service';
import { Order, OrderStatus } from '../../models/order.interface';
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

  // Chart data for dynamic graphs
  chartData = {
    // Orders over time chart data
    ordersOverTime: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      confirmedOrders: [15, 23, 18, 31, 28, 35, 42, 38, 45, 39, 41, 48],
      deliveredOrders: [12, 20, 15, 28, 25, 30, 38, 35, 40, 36, 38, 44],
      currentYear: new Date().getFullYear(),
      maxValue: 50
    },
    // User/client statistics
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      userGrowthPercentage: 82, // percentage of growth or activity
      monthlyGrowth: [20, 25, 30, 28, 35, 40, 38, 42, 45, 48, 50, 52] // monthly user growth trend
    }
  };

  // Mock data as fallback
  private mockOrders: Order[] = [
    {
      id: 1,
      orderDate: '2024-01-15T10:30:00',
      status: OrderStatus.DELIVERED,
      deliveryMethod: 'Standard',
      user: {
        id: 1,
        firstName: 'Derrick',
        lastName: 'Spencer',
        email: 'derrick.spencer@example.com'
      },
      orderItems: [
        {
          id: 1,
          quantity: 2,
          product: {
            id: 1,
            name: 'Premium Hoodie',
            price: 450.50,
            imageUrl: '/assets/hoodie.svg'
          }
        },
        {
          id: 2,
          quantity: 1,
          product: {
            id: 2,
            name: 'Classic T-Shirt',
            price: 189.76,
            imageUrl: '/assets/pull.png'
          }
        }
      ]
    },
    {
      id: 2,
      orderDate: '2024-01-14T14:20:00',
      status: OrderStatus.PENDING,
      deliveryMethod: 'Express',
      user: {
        id: 2,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com'
      },
      orderItems: [
        {
          id: 3,
          quantity: 3,
          product: {
            id: 3,
            name: 'Designer Pull',
            price: 320.00,
            imageUrl: '/assets/pull.png'
          }
        }
      ]
    },
    {
      id: 3,
      orderDate: '2024-01-13T09:15:00',
      status: OrderStatus.CONFIRMED,
      deliveryMethod: 'Standard',
      user: {
        id: 3,
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        email: 'ahmed.benali@example.com'
      },
      orderItems: [
        {
          id: 4,
          quantity: 1,
          product: {
            id: 4,
            name: 'Premium Hoodie',
            price: 450.50,
            imageUrl: '/assets/hoodie.svg'
          }
        },
        {
          id: 5,
          quantity: 2,
          product: {
            id: 5,
            name: 'Classic T-Shirt',
            price: 189.76,
            imageUrl: '/assets/pull.png'
          }
        }
      ]
    },
    {
      id: 4,
      orderDate: '2024-01-12T16:45:00',
      status: OrderStatus.DELIVERED,
      deliveryMethod: 'Express',
      user: {
        id: 4,
        firstName: 'Fatma',
        lastName: 'Trabelsi',
        email: 'fatma.trabelsi@example.com'
      },
      orderItems: [
        {
          id: 6,
          quantity: 4,
          product: {
            id: 6,
            name: 'Designer Pull',
            price: 320.00,
            imageUrl: '/assets/pull.png'
          }
        }
      ]
    },
    {
      id: 5,
      orderDate: '2024-01-11T11:30:00',
      status: OrderStatus.CANCELLED,
      deliveryMethod: 'Standard',
      user: {
        id: 5,
        firstName: 'Mohamed',
        lastName: 'Gharbi',
        email: 'mohamed.gharbi@example.com'
      },
      orderItems: [
        {
          id: 7,
          quantity: 1,
          product: {
            id: 7,
            name: 'Premium Hoodie',
            price: 450.50,
            imageUrl: '/assets/hoodie.svg'
          }
        }
      ]
    }
  ];

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private dashboardEventService: DashboardEventService
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupAutoRefresh();
    this.setupEventListeners();
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
    // Écouter les événements de mise à jour des commandes
    this.eventSubscription = this.dashboardEventService.orderUpdated$.subscribe(() => {
      console.log('🔄 Event received: Refreshing dashboard data...');
      this.loadData();
    });
  }

  private setupAutoRefresh() {
    // Auto-refresh every 30 seconds when not using mock data
    this.refreshSubscription = interval(this.REFRESH_INTERVAL)
      .pipe(
        switchMap(() => {
          if (!this.usingMockData) {
            console.log('🔄 Auto-refreshing dashboard data...');
            return this.orderService.getOrders(0, 20, 'orderDate', 'desc');
          }
          return [];
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.orders) {
            // Take all orders, sort by date descending, then take only the first 5
            const orders = response.orders || [];
            this.latestOrders = orders
              .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
              .slice(0, 5);
            
            this.loadStatistics(); // Refresh statistics as well
            console.log(`✅ Dashboard auto-refreshed with ${this.latestOrders.length} orders (newest first)`);
          }
        },
        error: (error) => {
          console.warn('Auto-refresh failed, switching to mock data:', error);
          if (!this.usingMockData) {
            this.usingMockData = true;
            this.latestOrders = this.mockOrders
              .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
              .slice(0, 5);
            this.loadMockStatistics();
          }
        }
      });
  }

  loadData() {
    this.loadLatestOrders();
    this.loadStatistics();
    this.loadChartData();
  }

  loadLatestOrders() {
    this.loading = true;
    this.error = null;
    this.usingMockData = false;
    
    // Get the latest orders - requesting more to ensure we get enough, then limit ourselves
    this.orderService.getOrders(0, 20, 'orderDate', 'desc').subscribe({
      next: (response) => {
        // Take all orders, sort by date descending, then take only the first 5
        const orders = response.orders || [];
        console.log(`📊 Received ${orders.length} orders from backend`);
        
        // Sort by date descending (most recent first) and take only 5
        this.latestOrders = orders
          .sort((a: any, b: any) => {
            const dateA = new Date(a.orderDate).getTime();
            const dateB = new Date(b.orderDate).getTime();
            console.log(`🗓️ Comparing Order #${a.id} (${a.orderDate}) vs Order #${b.id} (${b.orderDate})`);
            return dateB - dateA; // Descending order (newest first)
          })
          .slice(0, 5); // Take only the first 5
        
        this.loading = false;
        console.log(`✅ Latest ${this.latestOrders.length} orders loaded and sorted:`, 
          this.latestOrders.map(o => `#${o.id} (${o.orderDate} - ${o.status})`));
      },
      error: (error) => {
        console.warn('Backend not accessible, using mock data:', error);
        // Use mock data when backend is not accessible - ensure only 5 orders
        this.latestOrders = this.mockOrders
          .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 5);
        
        this.usingMockData = true;
        this.loading = false;
        this.error = null; // Don't show error when using mock data
        console.log(`📊 Using ${this.latestOrders.length} mock orders:`, 
          this.latestOrders.map(o => `#${o.id} (${o.status})`));
      }
    });
  }

  loadStatistics() {
    // Try to load from backend first
    this.loadBackendStatistics().catch(() => {
      // If backend fails, use mock statistics
      this.loadMockStatistics();
    });
  }

  private async loadBackendStatistics() {
    try {
      console.log('📊 Loading statistics from backend...');
      
      // Load pending orders (PENDING status = not yet validated by admin)
      const pendingResponse = await this.orderService.getOrders(0, 1000, 'orderDate', 'desc', OrderStatus.PENDING).toPromise();
      this.stats.pendingOrders = pendingResponse?.totalElements || 0;

      // Load delivered orders (DELIVERED status = validated and delivered by admin)
      const deliveredResponse = await this.orderService.getOrders(0, 1000, 'orderDate', 'desc', OrderStatus.DELIVERED).toPromise();
      this.stats.deliveredOrders = deliveredResponse?.totalElements || 0;

      // Load ALL orders to get the correct total count (including all statuses)
      const allOrdersResponse = await this.orderService.getOrders(0, 1000, 'orderDate', 'desc').toPromise();
      this.stats.totalOrders = allOrdersResponse?.totalElements || 0;
      
      // Calculate total revenue from DELIVERED orders only (same as stats page)
      // Only count delivered orders as actual revenue
      this.stats.totalRevenue = allOrdersResponse?.orders
        .filter(order => {
          const status = order.status as string;
          return status === OrderStatus.DELIVERED || 
                 status === 'delivered' || 
                 status === 'livrée';
        })
        .reduce((total, order) => total + this.calculateOrderTotal(order), 0) || 0;

      // DON'T override latestOrders here - they are already properly sorted and limited by loadLatestOrders()
      // Only use allOrdersResponse for statistics calculations and chart data
      const allOrders = allOrdersResponse?.orders || [];
        
      console.log('✅ Statistics loaded:', this.stats);
      console.log('📊 Total orders from API:', allOrdersResponse?.totalElements);
      console.log('📋 Current latestOrders count:', this.latestOrders.length);
      console.log('💰 Revenue calculation:', {
        confirmedOrders: allOrders.filter(o => o.status === OrderStatus.CONFIRMED).length,
        deliveredOrders: allOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
        cancelledOrders: allOrders.filter(o => o.status === OrderStatus.CANCELLED).length,
        totalRevenue: this.stats.totalRevenue
      });
    } catch (error) {
      throw error; // Re-throw to trigger fallback
    }
  }

  private loadMockStatistics() {
    console.info('📊 Using mock statistics data');
    // Calculate statistics from mock data
    this.stats.totalOrders = this.mockOrders.length;
    this.stats.pendingOrders = this.mockOrders.filter(order => 
      order.status === OrderStatus.PENDING).length;
    this.stats.deliveredOrders = this.mockOrders.filter(order => 
      order.status === OrderStatus.DELIVERED).length;
    this.stats.totalRevenue = this.mockOrders
      .filter(order => order.status === OrderStatus.DELIVERED)
      .reduce((total, order) => total + this.calculateOrderTotal(order), 0);
  }

  // Manual refresh function
  refreshData() {
    console.log('🔄 Manual refresh triggered');
    this.loadData();
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
    console.warn('🔄 Using mock chart data as fallback');
    this.chartData.ordersOverTime = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      confirmedOrders: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // 1 confirmed in September
      deliveredOrders: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // 1 delivered in September  
      currentYear: new Date().getFullYear(),
      maxValue: 3 // Lower scale for realistic data
    };
    console.log('📊 Mock chart data loaded (realistic small business data)');
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
}
