import { NextResponse } from "next/server";
import { createPublicClient, http, keccak256, parseAbi, toBytes, type Address, type Hex } from "viem";

export const dynamic = "force-dynamic";

const DEFAULT_REGISTRY = "0xB5C57CD5aB6592ca4FddD516161eDD3ba92BC818";
const ZERO_HASH = `0x${"0".repeat(64)}`;
const proofAbi = parseAbi([
  "struct ProofRecord { bytes32 proofHash; bytes32 ruleHash; bytes32 versionHash; bytes32 parentHash; uint64 affectedHolderCount; uint64 anchoredAt; uint64 enactedAt; uint256 strandedValue; bool consumed; }",
  "function activeProof(bytes32 assetId) view returns (ProofRecord)",
]);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const registry = params.get("registry") ?? process.env.POLICY_REGISTRY ?? DEFAULT_REGISTRY;
  const asset = params.get("asset")?.trim() || "MERIDIAN-NOTE-1";
  if (!/^0x[0-9a-fA-F]{40}$/.test(registry)) {
    return NextResponse.json({ error: "Registry must be a 20-byte EVM address." }, { status: 400 });
  }
  const assetId = (/^0x[0-9a-fA-F]{64}$/.test(asset) ? asset : keccak256(toBytes(asset))) as Hex;
  const client = createPublicClient({
    chain: {
      id: 10143,
      name: "Monad Testnet",
      nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
      rpcUrls: { default: { http: [process.env.MONAD_RPC ?? "https://testnet-rpc.monad.xyz"] } },
    },
    transport: http(process.env.MONAD_RPC ?? "https://testnet-rpc.monad.xyz"),
  });

  try {
    const proof = await client.readContract({ address: registry as Address, abi: proofAbi, functionName: "activeProof", args: [assetId] });
    const verified = proof.consumed && proof.proofHash !== ZERO_HASH && proof.versionHash !== ZERO_HASH && proof.anchoredAt > 0n && proof.anchoredAt <= proof.enactedAt;
    return NextResponse.json({
      verified,
      chainId: 10143,
      registry,
      asset,
      assetId,
      proof: {
        ...proof,
        affectedHolderCount: proof.affectedHolderCount.toString(),
        anchoredAt: proof.anchoredAt.toString(),
        enactedAt: proof.enactedAt.toString(),
        strandedValue: proof.strandedValue.toString(),
      },
    });
  } catch {
    return NextResponse.json({
      verified: false,
      code: "PROOF_UNAVAILABLE",
      registry,
      asset,
      assetId,
      error: "This registry has no active public pre-enactment proof for that asset.",
    });
  }
}