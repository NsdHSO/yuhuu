# Tab Layout Tests - Known Limitations

## The Problem We Discovered

Our unit tests gave **false confidence** - they passed while the app was broken.

### The Bug That Was Missed

**What happened:**
1. We wrote: `href: isAdmin ? undefined : null`
2. Expo Router normalized it to: `href: undefined` (always!)
3. CustomTabBar filtered: `href !== null` (true for undefined)
4. **Result**: Admin tab showed up for non-admin users ❌

**Why tests didn't catch it:**
- Unit tests mocked Expo Router's Tabs
- Mock correctly filtered `tabBarButton: () => null`
- But mock didn't reproduce Expo Router's href normalization
- **Tests passed ✅ but app was broken ❌**

## Current Test Coverage

### ✅ What Our Unit Tests DO Cover:
- Role-based logic (`isAdmin`, `isMemberOnly`)
- Expected behavior (tabs with `tabBarButton: () => null` should hide)
- React component rendering
- State management

### ❌ What Our Unit Tests CAN'T Cover:
- Expo Router's actual behavior (normalization, option passing)
- CustomTabBar's integration with React Navigation
- Real navigation state management
- Third-party library quirks

## The Real Solution: E2E Tests

For **full confidence**, we need **End-to-End tests** that:
1. Run the actual app
2. Use real Expo Router + CustomTabBar
3. Test with real user flows

### Recommended E2E Framework:

**Maestro** (recommended for React Native):
```yaml
# e2e/admin-tab-hidden.yaml
appId: com.anonymous.yuhuu
---
# Test: Non-admin users should NOT see Admin tab
- launchApp
- assertVisible: "Supper"
- assertVisible: "Profile"
- assertNotVisible: "Admin"  # THIS would have caught the bug!
```

**Detox** (alternative):
```typescript
// e2e/tabs.e2e.ts
describe('Admin Tab Access', () => {
  it('should hide Admin tab for Member-only users', async () => {
    await device.launchApp();
    await element(by.text('Admin')).not.toExist();  // Would catch the bug!
  });
});
```

## What We Did Instead (Workaround)

Since E2E tests weren't set up, we:
1. **Documented the limitation** in test file comments
2. **Manual testing** confirmed the fix works
3. **Changed approach**: Use `tabBarButton` instead of `href`
4. **Added this README** to explain the limitation

## Action Items for Future

- [ ] Set up Maestro or Detox for E2E testing
- [ ] Add E2E test for tab visibility by role
- [ ] Add E2E test for admin route protection
- [ ] Run E2E tests in CI/CD pipeline

## Lessons Learned

1. **Unit tests mock behavior** - they test what you THINK will happen
2. **Integration bugs need integration tests** - can't mock away the complexity
3. **Manual testing is still critical** - especially for UI/UX features
4. **E2E tests are the ultimate safety net** - test the real app, not mocks

---

**Bottom line**: Our unit tests are good for logic, but **E2E tests would have caught this bug immediately**. Until then, manual testing + code review are essential.
