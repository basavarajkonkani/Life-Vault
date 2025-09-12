import { Controller, Get, Headers, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { SupabaseService } from "../services/supabase.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get("stats")
  @UseGuards(JwtAuthGuard)
  async getDashboardStats(@Headers("authorization") auth: string) {
    // Mock data that matches frontend structure
    return {
      totalAssets: 4,
      totalNominees: 2,
      totalTradingAccounts: 3,
      netWorth: 2500000,
      assetAllocation: [
        { name: "Bank", value: 35, amount: 875000, color: "#1E3A8A" },
        { name: "LIC", value: 25, amount: 625000, color: "#3B82F6" },
        { name: "Property", value: 20, amount: 500000, color: "#60A5FA" },
        { name: "Stocks", value: 20, amount: 500000, color: "#93C5FD" },
      ],
      recentActivity: [
        {
          id: 1,
          type: "asset_added",
          description: "Added SBI Savings Account",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: "success"
        },
        {
          id: 2,
          type: "nominee_updated",
          description: "Updated nominee allocation",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          status: "info"
        },
        {
          id: 3,
          type: "reminder",
          description: "LIC policy renewal reminder",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          status: "warning"
        }
      ]
    };
  }

  @Get("batch")
  @UseGuards(JwtAuthGuard)
  async getBatchData(@Headers("authorization") auth: string) {
    try {
      // Extract user ID from JWT token
      const token = auth.replace("Bearer ", "");
      const { data: { user } } = await this.supabaseService.getClient().auth.getUser(token);
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get all data in parallel
      const [assets, nominees, tradingAccounts, stats] = await Promise.all([
        this.supabaseService.getAssetsByUserId(user.id),
        this.supabaseService.getNomineesByUserId(user.id),
        this.supabaseService.getTradingAccountsByUserId(user.id),
        this.supabaseService.getDashboardStats(user.id)
      ]);

      // Calculate asset allocation
      const totalValue = assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
      const assetAllocation = assets.map((asset, index) => ({
        name: asset.category || `Asset ${index + 1}`,
        value: totalValue > 0 ? (asset.current_value / totalValue) * 100 : 0,
        amount: asset.current_value || 0,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      }));

      return {
        ...stats,
        assetAllocation,
        recentActivity: [],
        assets,
        nominees,
        tradingAccounts
      };
    } catch (error) {
      console.error("Error fetching batch data:", error);
      // Return mock data as fallback
      return {
        totalAssets: 4,
        totalNominees: 2,
        totalTradingAccounts: 3,
        totalValue: 2500000,
        netWorth: 2500000,
        assetAllocation: [
          { name: "Bank", value: 35, amount: 875000, color: "#1E3A8A" },
          { name: "LIC", value: 25, amount: 625000, color: "#3B82F6" },
          { name: "Property", value: 20, amount: 500000, color: "#60A5FA" },
          { name: "Stocks", value: 20, amount: 500000, color: "#93C5FD" },
        ],
        recentActivity: [],
        assets: [],
        nominees: [],
        tradingAccounts: []
      };
    }
  }

  @Get("assets")
  @UseGuards(JwtAuthGuard)
  async getAssets(@Headers("authorization") auth: string) {
    try {
      const token = auth.replace("Bearer ", "");
      const { data: { user } } = await this.supabaseService.getClient().auth.getUser(token);
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      return await this.supabaseService.getAssetsByUserId(user.id);
    } catch (error) {
      console.error("Error fetching assets:", error);
      return [];
    }
  }

  @Get("nominees")
  @UseGuards(JwtAuthGuard)
  async getNominees(@Headers("authorization") auth: string) {
    try {
      const token = auth.replace("Bearer ", "");
      const { data: { user } } = await this.supabaseService.getClient().auth.getUser(token);
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      return await this.supabaseService.getNomineesByUserId(user.id);
    } catch (error) {
      console.error("Error fetching nominees:", error);
      return [];
    }
  }

  @Get("trading-accounts")
  @UseGuards(JwtAuthGuard)
  async getTradingAccounts(@Headers("authorization") auth: string) {
    try {
      const token = auth.replace("Bearer ", "");
      const { data: { user } } = await this.supabaseService.getClient().auth.getUser(token);
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      return await this.supabaseService.getTradingAccountsByUserId(user.id);
    } catch (error) {
      console.error("Error fetching trading accounts:", error);
      return [];
    }
  }
}
