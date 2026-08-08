import { parseAbi } from "viem";

export const registryAbi = parseAbi([
  "struct Attestation { address wallet; bytes32 cvRecordId; uint8 tier; uint8 subTier; bytes2 group; bytes2 subGroup; bytes2 country; uint8 status; uint64 expiry; }",
  "function attestBatch(Attestation[] batch)",
  "function setStatus(address wallet, uint8 status)",
  "function holderOf(address wallet) view returns ((bytes32 cvRecordId, uint8 tier, uint8 subTier, bytes2 group, bytes2 subGroup, bytes2 country, uint8 status, uint64 expiry, bool exists))",
  "function walletCount() view returns (uint256)",
]);

export const policyAbi = parseAbi([
  "struct Rule { bytes2 group; bytes2 subGroup; uint8 minTier; uint8 minSubTier; bytes2[] countries; bool isBlackList; bool active; }",
  "struct ProofRecord { bytes32 proofHash; bytes32 ruleHash; bytes32 versionHash; bytes32 parentHash; uint64 affectedHolderCount; uint64 anchoredAt; uint64 enactedAt; uint256 strandedValue; bool consumed; }",
  "function anchorProof(bytes32 assetId, Rule rule, bytes32 proofHash, uint64 affectedHolderCount, uint256 strandedValue)",
  "function enact(bytes32 assetId, Rule rule, string memo, bytes32 proofHash) returns (bytes32)",
  "function versionCount(bytes32 assetId) view returns (uint256)",
  "function versionAt(bytes32 assetId, uint256 i) view returns ((bytes32 hash, bytes32 parentHash, bytes32 proofHash, uint64 enactedAt, string memo))",
  "function proofByHash(bytes32 assetId, bytes32 proofHash) view returns (ProofRecord)",
  "function proofAt(bytes32 assetId, uint256 version) view returns (ProofRecord)",
  "function activeProof(bytes32 assetId) view returns (ProofRecord)",
  "event ProofAnchored(bytes32 indexed assetId, bytes32 indexed proofHash, bytes32 indexed ruleHash, bytes32 parentHash, uint64 affectedHolderCount, uint256 strandedValue)",
  "event PolicyEnacted(bytes32 indexed assetId, bytes32 indexed versionHash, bytes32 indexed proofHash, bytes32 parentHash, string memo)",
]);

export const noteAbi = parseAbi([
  "function mint(address to, uint256 amount)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function checkTransfer(address from, address to) view returns (uint8, uint8)",
  "error TransferIneligible(address wallet, uint8 reason)",
]);

export const cashAbi = parseAbi([
  "function mint(address to, uint256 amount)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
]);

export const engineAbi = parseAbi([
  "function createRun(bytes32 assetId, address payoutToken, address[] holders, uint128[] amounts, string memo) returns (uint256)",
  "function payLegs(uint256 runId, uint256 from, uint256 to)",
  "function releaseLeg(uint256 runId, uint256 legIndex)",
  "function legAt(uint256 runId, uint256 i) view returns ((address holder, uint128 amount, uint8 state, uint8 reason))",
  "function runCount() view returns (uint256)",
]);
