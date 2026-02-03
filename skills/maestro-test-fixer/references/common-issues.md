# Common Maestro Test Issues and Solutions

## Table of Contents
1. [Element Not Found](#element-not-found)
2. [Timing Issues](#timing-issues)
3. [Keyboard Issues](#keyboard-issues)
4. [State Management](#state-management)
5. [Conditional Flows](#conditional-flows)
6. [gRPC Connection Issues](#grpc-connection-issues)

---

## Element Not Found

### Problem: Button text matches multiple elements
**Symptom:** Test finds wrong element (e.g., "Staff Login" button instead of dialog)

**Solution:** Use more specific text that only appears in target context:
```yaml
# Bad - matches button AND dialog title
- runFlow:
    when:
      visible: "Staff Login"

# Good - only matches dialog content
- runFlow:
    when:
      visible: "Please enter staff PIN"
```

### Problem: Element appears with different text
**Symptom:** `Text matching regex: TAKEAWAY` not found

**Solution:** Check actual text case and use regex OR:
```yaml
# Handles case variations
- extendedWaitUntil:
    visible: "TAKEAWAY|Takeaway|takeaway"
```

### Problem: Element has ID but no text
**Solution:** Use element ID instead:
```yaml
- tapOn:
    id: "com.app.id:id/button_name"
```

---

## Timing Issues

### Problem: Element not loaded yet
**Symptom:** Test fails intermittently

**Solution:** Add explicit wait with timeout:
```yaml
- extendedWaitUntil:
    visible: "Target Element"
    timeout: 15000  # 15 seconds
```

### Problem: Animation still in progress
**Solution:** Add animation wait:
```yaml
- tapOn:
    text: "Button"
- waitForAnimationToEnd
```

### Problem: Toast/loading overlay blocks interaction
**Solution:** Wait for it to disappear:
```yaml
- waitForAnimationToEnd
- repeat:
    times: 2
    commands:
      - waitForAnimationToEnd
```

---

## Keyboard Issues

### Problem: Keyboard covers bottom buttons
**Symptom:** Can't tap "ADD & CLOSE" after text input

**Solution:** Always hide keyboard after text input:
```yaml
- tapOn:
    id: "notes_field"
- inputText: "Some note"
- hideKeyboard
- waitForAnimationToEnd
- tapOn:
    text: "ADD & CLOSE"
```

### Problem: Keyboard doesn't appear for input
**Solution:** Tap on input field first:
```yaml
- tapOn:
    id: "input_field"
- waitForAnimationToEnd
- inputText: "text"
```

---

## State Management

### Problem: Test works alone but fails in sequence
**Cause:** Previous test left app in unexpected state

**Solution:** Force stop app before each test:
```bash
adb shell am force-stop com.app.id
sleep 2
maestro test test_file.yaml
```

Or in test script:
```yaml
- launchApp:
    appId: com.app.id
    stopApp: true  # Force restart
```

### Problem: Login state persists across tests
**Solution:** Create a clean login flow that handles all states:
```yaml
# login.yaml handles: logged out, logged in, session expired
- extendedWaitUntil:
    visible: "Login|Main Menu|Session Expired"
    timeout: 30000
- runFlow:
    when:
      visible: "Login"
    commands:
      - # perform login
- runFlow:
    when:
      visible: "Session Expired"
    commands:
      - tapOn:
          text: "OK"
      - # perform login
```

---

## Conditional Flows

### Problem: Dialog may or may not appear
**Solution:** Use optional tap or conditional flow:
```yaml
# Option 1: Optional tap (won't fail if not found)
- tapOn:
    text: "OK"
    optional: true

# Option 2: Conditional flow (more control)
- runFlow:
    when:
      visible: "Confirmation Dialog"
    commands:
      - tapOn:
          text: "Confirm"
```

### Problem: Different paths based on state
**Solution:** Use multiple conditional flows:
```yaml
- runFlow:
    when:
      visible: "State A"
    commands:
      - # handle state A

- runFlow:
    when:
      visible: "State B"
    commands:
      - # handle state B
```

---

## gRPC Connection Issues

### Problem: `Connection refused: localhost:7001`
**Cause:** Maestro driver not connected to device

**Solutions:**

1. Restart Maestro:
```bash
pkill -f maestro
maestro test test_file.yaml
```

2. Restart ADB:
```bash
adb kill-server
adb start-server
adb devices
```

3. Reconnect emulator:
```bash
adb connect localhost:5554
```

4. Reinstall Maestro:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Problem: Device not found
**Solution:** Check connection:
```bash
adb devices -l
# Should show: emulator-5554 device product:... model:...
```

---

## Best Practices Checklist

Before fixing a test:
- [ ] Force stop app
- [ ] Take screenshot of current state
- [ ] Read the test script to understand expected flow
- [ ] Execute steps one by one manually
- [ ] Identify exact step that fails
- [ ] Check if it's a test issue or app bug

When fixing:
- [ ] Use specific element selectors (prefer ID > unique text > generic text)
- [ ] Add `waitForAnimationToEnd` after taps
- [ ] Add `hideKeyboard` after text input
- [ ] Use `extendedWaitUntil` with appropriate timeout
- [ ] Handle optional dialogs with `runFlow when`
- [ ] Extract common sequences to subflows

After fixing:
- [ ] Run test 3 times to verify stability
- [ ] Run full test suite to check no regressions
- [ ] Document any app bugs found
