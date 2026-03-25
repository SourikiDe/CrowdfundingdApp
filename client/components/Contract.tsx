"use client";

import { useState, useCallback } from "react";
import {
  createCampaign,
  contribute,
  getCampaign,
  getContribution,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Status Config ────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; variant: "success" | "warning" | "info" }> = {
  Active: { color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", variant: "success" },
  Funded: { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]/10", border: "border-[#4fc3f7]/20", dot: "bg-[#4fc3f7]", variant: "info" },
  Pending: { color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/20", dot: "bg-[#fbbf24]", variant: "warning" },
};

// ── Main Component ───────────────────────────────────────────

type Tab = "view" | "create" | "contribute";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Create campaign
  const [goalAmount, setGoalAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Contribute
  const [creatorAddress, setCreatorAddress] = useState("");
  const [contributeAmount, setContributeAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);

  // View
  const [viewAddress, setViewAddress] = useState("");
  const [viewMode, setViewMode] = useState<"campaign" | "contribution">("campaign");
  const [isViewing, setIsViewing] = useState(false);
  const [viewResult, setViewResult] = useState<bigint | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatXLM = (amount: bigint) => {
    const num = Number(amount) / 10000000;
    return num.toLocaleString(undefined, { maximumFractionDigits: 7 });
  };

  const handleCreateCampaign = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!goalAmount.trim()) return setError("Enter a goal amount");
    const goal = BigInt(Math.floor(Number(goalAmount) * 10000000));
    if (goal <= BigInt(0)) return setError("Goal must be greater than 0");
    setError(null);
    setIsCreating(true);
    setTxStatus("Awaiting signature...");
    try {
      await createCampaign(walletAddress, goal);
      setTxStatus("Campaign created on-chain!");
      setGoalAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  }, [walletAddress, goalAmount]);

  const handleContribute = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!creatorAddress.trim()) return setError("Enter creator address");
    if (!contributeAmount.trim()) return setError("Enter contribution amount");
    const amount = BigInt(Math.floor(Number(contributeAmount) * 10000000));
    if (amount <= BigInt(0)) return setError("Amount must be greater than 0");
    setError(null);
    setIsContributing(true);
    setTxStatus("Awaiting signature...");
    try {
      await contribute(walletAddress, creatorAddress.trim(), amount);
      setTxStatus("Contribution made on-chain!");
      setCreatorAddress("");
      setContributeAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsContributing(false);
    }
  }, [walletAddress, creatorAddress, contributeAmount]);

  const handleView = useCallback(async () => {
    if (!viewAddress.trim()) return setError("Enter an address");
    setError(null);
    setIsViewing(true);
    setViewResult(null);
    try {
      const result = viewMode === "campaign" 
        ? await getCampaign(viewAddress.trim(), walletAddress || undefined)
        : await getContribution(viewAddress.trim(), walletAddress || undefined);
      setViewResult(result as bigint);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [viewAddress, viewMode, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "view", label: "View", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "create", label: "Create", icon: <TargetIcon />, color: "#7c6cf0" },
    { key: "contribute", label: "Contribute", icon: <HeartIcon />, color: "#f472b6" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("updated") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f472b6]/20 to-[#7c6cf0]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f472b6]">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Crowdfunding dApp</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setViewResult(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* View */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <MethodSignature name="get_campaign / get_contribution" params="(address: Address)" returns="-> i128" color="#4fc3f7" />
                
                <div className="flex gap-2">
                  <button
                    onClick={() => { setViewMode("campaign"); setViewResult(null); }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-all",
                      viewMode === "campaign"
                        ? "border-[#4fc3f7]/30 bg-[#4fc3f7]/10 text-[#4fc3f7]"
                        : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white/55"
                    )}
                  >
                    <TargetIcon /> Campaign Goal
                  </button>
                  <button
                    onClick={() => { setViewMode("contribution"); setViewResult(null); }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-all",
                      viewMode === "contribution"
                        ? "border-[#f472b6]/30 bg-[#f472b6]/10 text-[#f472b6]"
                        : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white/55"
                    )}
                  >
                    <CoinIcon /> My Contribution
                  </button>
                </div>

                <Input 
                  label="Address" 
                  value={viewAddress} 
                  onChange={(e) => setViewAddress(e.target.value)} 
                  placeholder="G... address" 
                />
                
                <ShimmerButton onClick={handleView} disabled={isViewing} shimmerColor="#4fc3f7" className="w-full">
                  {isViewing ? <><SpinnerIcon /> Querying...</> : <><SearchIcon /> Query {viewMode === "campaign" ? "Campaign" : "Contribution"}</>}
                </ShimmerButton>

                {viewResult !== null && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
                        {viewMode === "campaign" ? "Campaign Goal" : "Your Contribution"}
                      </span>
                      <Badge variant={viewMode === "campaign" ? "info" : "success"}>
                        {viewMode === "campaign" ? <TargetIcon /> : <CoinIcon />}
                        {viewMode === "campaign" ? "Goal" : "Contributed"}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Amount</span>
                        <span className="font-mono text-xl text-white/80">{formatXLM(viewResult)} XLM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create */}
            {activeTab === "create" && (
              <div className="space-y-5">
                <MethodSignature name="create_campaign" params="(creator: Address, goal: i128)" color="#7c6cf0" />
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-xs text-white/40">
                  Create a new crowdfunding campaign. You will be the campaign creator and others can contribute to your goal.
                </div>
                <Input 
                  label="Goal Amount (XLM)" 
                  type="number"
                  step="0.0000001"
                  min="0"
                  value={goalAmount} 
                  onChange={(e) => setGoalAmount(e.target.value)} 
                  placeholder="e.g. 1000" 
                />
                
                {walletAddress ? (
                  <ShimmerButton onClick={handleCreateCampaign} disabled={isCreating} shimmerColor="#7c6cf0" className="w-full">
                    {isCreating ? <><SpinnerIcon /> Creating...</> : <><TargetIcon /> Create Campaign</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to create campaign
                  </button>
                )}
              </div>
            )}

            {/* Contribute */}
            {activeTab === "contribute" && (
              <div className="space-y-5">
                <MethodSignature name="contribute" params="(contributor: Address, creator: Address, amount: i128)" color="#f472b6" />
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-xs text-white/40">
                  Support a campaign by contributing XLM. Enter the campaign creator's address and amount.
                </div>
                <Input 
                  label="Campaign Creator Address" 
                  value={creatorAddress} 
                  onChange={(e) => setCreatorAddress(e.target.value)} 
                  placeholder="G... address" 
                />
                <Input 
                  label="Contribution Amount (XLM)" 
                  type="number"
                  step="0.0000001"
                  min="0"
                  value={contributeAmount} 
                  onChange={(e) => setContributeAmount(e.target.value)} 
                  placeholder="e.g. 50" 
                />
                
                {walletAddress ? (
                  <ShimmerButton onClick={handleContribute} disabled={isContributing} shimmerColor="#f472b6" className="w-full">
                    {isContributing ? <><SpinnerIcon /> Contributing...</> : <><HeartIcon /> Contribute</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f472b6]/20 bg-[#f472b6]/[0.03] py-4 text-sm text-[#f472b6]/60 hover:border-[#f472b6]/30 hover:text-[#f472b6]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to contribute
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Crowdfunding dApp &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["XLM", "Testnet", "Freighter"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 2 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
