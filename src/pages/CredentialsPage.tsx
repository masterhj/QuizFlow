import { useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { Wallet, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataRow,
  Dot,
  EmptyState,
  Label,
  Page,
  PageHeader,
  Select,
  formatDate,
  gradeFor,
  subjectAccent,
} from '../components/ui';
import { cn } from '../utils/cn';

/**
 * Soulbound credentials. This used to be a tab buried inside the dashboard;
 * it is a real destination, so it gets a real route.
 */
export default function CredentialsPage() {
  const { sbtList, wallet, connectMockWallet, disconnectMockWallet, switchNetwork } =
    useQuizStore();

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Page>
      <PageHeader
        title="Credentials"
        description="Non-transferable proof-of-knowledge tokens minted for your passing scores. This is a simulated chain — no real transactions are made."
      />

      {/* Wallet */}
      <Card className="mb-6">
        <CardHeader
          title="Wallet"
          description={
            wallet.connected
              ? 'Connected to a simulated browser wallet.'
              : 'Connect a simulated wallet to mint new credentials.'
          }
          action={
            wallet.connected ? (
              <Button variant="ghost" onClick={disconnectMockWallet}>
                Disconnect
              </Button>
            ) : (
              <Button variant="primary" onClick={() => connectMockWallet('polygon')}>
                <Wallet className="h-3.5 w-3.5" />
                Connect wallet
              </Button>
            )
          }
        />
        {wallet.connected && (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Address</Label>
              <p className="flex items-center gap-1.5 truncate font-mono text-[12px] text-fg">
                <Dot tone="ok" pulse />
                {wallet.address}
              </p>
            </div>
            <div className="space-y-1">
              <Label>Balance</Label>
              <p data-numeric className="text-[13px] text-fg">
                {wallet.balance}
              </p>
            </div>
            <div className="space-y-1">
              <Label>Network</Label>
              <Select
                value={wallet.network}
                onChange={(e) => switchNetwork(e.target.value as any)}
              >
                <option value="ethereum">Ethereum Mainnet</option>
                <option value="polygon">Polygon PoS</option>
                <option value="arbitrum">Arbitrum One</option>
                <option value="solana">Solana Mainnet</option>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {/* Ledger */}
      <Card>
        <CardHeader
          title="Issued credentials"
          action={
            <span data-numeric className="text-[12px] text-fg-muted">
              {sbtList.length} total
            </span>
          }
        />

        {sbtList.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" />}
              title="No credentials yet"
              description="Score 50% or higher on a quiz, then mint from the results screen."
            />
          </div>
        ) : (
          <ul className="stagger divide-y divide-line">
            {sbtList.map((sbt, index) => {
              const open = expanded === sbt.tokenId;
              const accent = subjectAccent(sbt.subject);
              return (
                <li key={sbt.tokenId} style={{ ['--i' as string]: index }}>
                  <button
                    onClick={() => setExpanded(open ? null : sbt.tokenId)}
                    aria-expanded={open}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-raised"
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-transform duration-200 group-hover:scale-105',
                        accent.bg,
                        accent.line,
                        accent.text
                      )}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium capitalize text-fg">
                        {sbt.subject}
                      </span>
                      <span className="block text-[12px] text-fg-muted">
                        {sbt.network} · Issued {formatDate(sbt.mintedAt)}
                      </span>
                    </div>

                    <Badge tone="neutral" className="hidden font-mono sm:inline-flex">
                      {sbt.tokenId}
                    </Badge>

                    <span
                      data-numeric
                      className={cn('text-[13px]', gradeFor(sbt.score).text)}
                    >
                      {sbt.score}%
                    </span>

                    {open ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-fg-subtle" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-fg-subtle" />
                    )}
                  </button>

                  {open && (
                    <div className="animate-rise-in border-t border-line bg-canvas px-4 py-3">
                      <div className="mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-ok" />
                        <span className="text-[12px] text-ok">Transaction confirmed</span>
                      </div>
                      <div className="divide-y divide-line">
                        <DataRow label="Transaction hash" value={sbt.txHash} mono />
                        <DataRow label="Contract" value={sbt.contractAddress} mono />
                        <DataRow label="Metadata" value={sbt.metadataUri} mono />
                        <DataRow label="Block" value={`#${sbt.blockNumber}`} mono />
                        <DataRow label="Gas paid" value={sbt.gasPaid} />
                        <DataRow
                          label="Difficulty"
                          value={<span className="capitalize">{sbt.difficulty}</span>}
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </Page>
  );
}
