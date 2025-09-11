#!/bin/bash

echo "🧪 Testing LifeVault Complete CRUD Operations"
echo "=============================================="

BASE_URL="http://localhost:3001/api"
TOKEN="demo-token"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_field="$3"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command" | jq -e "$expected_field" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to run a test with error expectation
run_error_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command" | jq -e '.error' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n${YELLOW}=== DASHBOARD TESTS ===${NC}"

# Test dashboard stats
run_test "Dashboard Stats" "curl -s -H 'Authorization: Bearer $TOKEN' '$BASE_URL/dashboard/stats'" ".totalAssets"

echo -e "\n${YELLOW}=== ASSETS CRUD TESTS ===${NC}"

# Test get assets
run_test "Get Assets" "curl -s -H 'Authorization: Bearer $TOKEN' '$BASE_URL/dashboard/assets'" ".[0].id"

# Test create asset
ASSET_ID=$(curl -s -X POST "$BASE_URL/assets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category": "Test Asset",
    "institution": "Test Bank",
    "accountNumber": "TEST123456",
    "currentValue": 100000,
    "status": "Active",
    "notes": "Test asset for CRUD testing",
    "documents": []
  }' | jq -r '.id')

if [ "$ASSET_ID" != "null" ] && [ "$ASSET_ID" != "" ]; then
    echo -e "${GREEN}✅ PASSED: Create Asset (ID: $ASSET_ID)${NC}"
    ((TESTS_PASSED++))
    
    # Test update asset
    run_test "Update Asset" "curl -s -X PUT '$BASE_URL/assets/$ASSET_ID' \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer $TOKEN' \
      -d '{
        \"category\": \"Updated Test Asset\",
        \"institution\": \"Updated Test Bank\",
        \"accountNumber\": \"UPDATED123456\",
        \"currentValue\": 150000,
        \"status\": \"Active\",
        \"notes\": \"Updated test asset\",
        \"documents\": []
      }'" ".id"
    
    # Test delete asset
    run_test "Delete Asset" "curl -s -X DELETE '$BASE_URL/assets/$ASSET_ID' \
      -H 'Authorization: Bearer $TOKEN'" ".success"
else
    echo -e "${RED}❌ FAILED: Create Asset${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n${YELLOW}=== NOMINEES CRUD TESTS ===${NC}"

# Test get nominees
run_test "Get Nominees" "curl -s -H 'Authorization: Bearer $TOKEN' '$BASE_URL/dashboard/nominees'" ".[0].id"

# Test create nominee
NOMINEE_ID=$(curl -s -X POST "$BASE_URL/nominees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Nominee",
    "relation": "Child",
    "phone": "+91 9999999999",
    "email": "test-nominee@example.com",
    "allocationPercentage": 50,
    "isExecutor": true,
    "isBackup": false
  }' | jq -r '.id')

if [ "$NOMINEE_ID" != "null" ] && [ "$NOMINEE_ID" != "" ]; then
    echo -e "${GREEN}✅ PASSED: Create Nominee (ID: $NOMINEE_ID)${NC}"
    ((TESTS_PASSED++))
    
    # Test update nominee
    run_test "Update Nominee" "curl -s -X PUT '$BASE_URL/nominees/$NOMINEE_ID' \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer $TOKEN' \
      -d '{
        \"name\": \"Updated Test Nominee\",
        \"relation\": \"Child\",
        \"phone\": \"+91 9999999999\",
        \"email\": \"updated-test-nominee@example.com\",
        \"allocationPercentage\": 60,
        \"isExecutor\": false,
        \"isBackup\": true
      }'" ".id"
    
    # Test delete nominee
    run_test "Delete Nominee" "curl -s -X DELETE '$BASE_URL/nominees/$NOMINEE_ID' \
      -H 'Authorization: Bearer $TOKEN'" ".success"
else
    echo -e "${RED}❌ FAILED: Create Nominee${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n${YELLOW}=== TRADING ACCOUNTS CRUD TESTS ===${NC}"

# Test get trading accounts
run_test "Get Trading Accounts" "curl -s -H 'Authorization: Bearer $TOKEN' '$BASE_URL/dashboard/trading-accounts'" ".[0].id"

# Test create trading account
TRADING_ID=$(curl -s -X POST "$BASE_URL/trading-accounts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "brokerName": "Test Broker",
    "clientId": "TEST123",
    "dematNumber": "DEMAT123456",
    "nomineeId": null,
    "currentValue": 200000,
    "status": "Active",
    "notes": "Test trading account"
  }' | jq -r '.id')

if [ "$TRADING_ID" != "null" ] && [ "$TRADING_ID" != "" ]; then
    echo -e "${GREEN}✅ PASSED: Create Trading Account (ID: $TRADING_ID)${NC}"
    ((TESTS_PASSED++))
    
    # Test update trading account
    run_test "Update Trading Account" "curl -s -X PUT '$BASE_URL/trading-accounts/$TRADING_ID' \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer $TOKEN' \
      -d '{
        \"brokerName\": \"Updated Test Broker\",
        \"clientId\": \"UPDATED123\",
        \"dematNumber\": \"UPDATED123456\",
        \"nomineeId\": null,
        \"currentValue\": 250000,
        \"status\": \"Active\",
        \"notes\": \"Updated test trading account\"
      }'" ".id"
    
    # Test delete trading account
    run_test "Delete Trading Account" "curl -s -X DELETE '$BASE_URL/trading-accounts/$TRADING_ID' \
      -H 'Authorization: Bearer $TOKEN'" ".success"
else
    echo -e "${RED}❌ FAILED: Create Trading Account${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n${YELLOW}=== VAULT REQUESTS CRUD TESTS ===${NC}"

# Test get vault requests
run_test "Get Vault Requests" "curl -s -H 'Authorization: Bearer $TOKEN' '$BASE_URL/vault-requests'" ".[0].id"

# Test create vault request
VAULT_ID=$(curl -s -X POST "$BASE_URL/vault-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "nomineeId": null,
    "nomineeName": "Test Vault Request",
    "relationToDeceased": "Son",
    "phoneNumber": "+91 8888888888",
    "email": "test-vault@example.com",
    "deathCertificateUrl": "https://example.com/cert.pdf"
  }' | jq -r '.id')

if [ "$VAULT_ID" != "null" ] && [ "$VAULT_ID" != "" ]; then
    echo -e "${GREEN}✅ PASSED: Create Vault Request (ID: $VAULT_ID)${NC}"
    ((TESTS_PASSED++))
    
    # Test update vault request
    run_test "Update Vault Request" "curl -s -X PUT '$BASE_URL/vault-requests/$VAULT_ID' \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer $TOKEN' \
      -d '{
        \"nomineeId\": null,
        \"nomineeName\": \"Updated Test Vault Request\",
        \"relationToDeceased\": \"Son\",
        \"phoneNumber\": \"+91 8888888888\",
        \"email\": \"updated-test-vault@example.com\",
        \"deathCertificateUrl\": \"https://example.com/updated-cert.pdf\",
        \"status\": \"approved\"
      }'" ".id"
    
    # Test delete vault request
    run_test "Delete Vault Request" "curl -s -X DELETE '$BASE_URL/vault-requests/$VAULT_ID' \
      -H 'Authorization: Bearer $TOKEN'" ".success"
else
    echo -e "${RED}❌ FAILED: Create Vault Request${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n${YELLOW}=== USER PROFILE TESTS ===${NC}"

# Test get user profile
run_test "Get User Profile" "curl -s -H 'Authorization: Bearer $TOKEN' '$BASE_URL/user/profile'" ".id"

# Test update user profile
run_test "Update User Profile" "curl -s -X PUT '$BASE_URL/user/profile' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{
    \"name\": \"Updated Demo User\",
    \"email\": \"updated-demo@lifevault.com\",
    \"address\": \"Updated Demo Address\"
  }'" ".id"

echo -e "\n${YELLOW}=== VALIDATION TESTS ===${NC}"

# Test invalid asset creation
run_error_test "Invalid Asset Creation" "curl -s -X POST '$BASE_URL/assets' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{
    \"category\": \"\",
    \"institution\": \"\",
    \"accountNumber\": \"\",
    \"currentValue\": -100
  }'"

# Test invalid nominee creation
run_error_test "Invalid Nominee Creation" "curl -s -X POST '$BASE_URL/nominees' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{
    \"name\": \"\",
    \"relation\": \"\",
    \"phone\": \"123\",
    \"email\": \"invalid-email\",
    \"allocationPercentage\": 150
  }'"

# Test invalid trading account creation
run_error_test "Invalid Trading Account Creation" "curl -s -X POST '$BASE_URL/trading-accounts' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{
    \"brokerName\": \"\",
    \"clientId\": \"\",
    \"dematNumber\": \"\",
    \"currentValue\": -100
  }'"

echo -e "\n${YELLOW}=== FINAL RESULTS ===${NC}"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! LifeVault CRUD operations are working perfectly!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the output above.${NC}"
    exit 1
fi
