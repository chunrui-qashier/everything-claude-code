---
name: maestro-test-fixer
description: Fix failing Maestro UI test scripts step by step. Use when debugging Android/iOS test failures, element not found errors, or test flow issues. Provides systematic debugging workflow with screenshots and manual step execution.
---

# Maestro Test Fixer

Systematic approach to debug and fix failing Maestro UI tests.

## Prerequisites

```bash
# Environment setup
export JAVA_HOME=~/jdk/jdk-17.0.2.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH:$HOME/.maestro/bin:$HOME/Library/Android/sdk/platform-tools"
```

## Debugging Workflow

### Step 1: Reproduce the Failure

```bash
# Force stop app to ensure clean state
adb shell am force-stop <app_id>
sleep 2

# Run the failing test
maestro test <test_file.yaml>
```

### Step 2: Capture Current State

```bash
# Take screenshot
adb exec-out screencap -p > /tmp/debug_state.png
```

Analyze the screenshot to understand:
- What screen is currently displayed?
- What elements are visible?
- Is there an error dialog?
- Is the keyboard blocking elements?

### Step 3: Execute Steps Manually

Create a minimal test file for each step:

```yaml
appId: <app_id>
---
- <single_command>
- waitForAnimationToEnd
```

Run and verify:
```bash
maestro test /tmp/step_N.yaml
adb exec-out screencap -p > /tmp/step_N_result.png
```

### Step 4: Identify Root Cause

Common issues and fixes:

| Issue | Symptom | Fix |
|-------|---------|-----|
| Element text mismatch | "Staff Login" button vs "Staff Login" dialog | Use unique text like "Please enter staff PIN" |
| Keyboard blocking | Can't tap buttons at bottom | Add `hideKeyboard` after text input |
| Missing wait | Element not found | Add `extendedWaitUntil` with timeout |
| State not reset | Test passes alone, fails in sequence | Add `force-stop` before test |
| Dialog not handled | Unexpected dialog blocks flow | Add conditional `runFlow` with `when` |
| **Image button** | Text selector fails on icon buttons | **Use element ID instead of text** |
| Cancel confirmation | Back button triggers "Confirm cancel?" | Handle with `tapOn: "YES"` |

### Step 5: Apply Fix

1. Update the test script with the fix
2. Re-run from clean state
3. Verify all steps pass
4. Take final screenshot to confirm

## Common Patterns

### Handle Optional Dialogs

```yaml
- runFlow:
    when:
      visible: "Dialog Title"
    commands:
      - tapOn:
          text: "OK"
      - waitForAnimationToEnd
```

### Wait for Multiple Possible States

```yaml
- extendedWaitUntil:
    visible: "State A|State B|State C"
    timeout: 15000
```

### Input Text and Hide Keyboard

```yaml
- tapOn:
    id: "input_field_id"
- inputText: "some text"
- hideKeyboard
- waitForAnimationToEnd
```

### Create Reusable Subflows

Extract common sequences into `flows/common/` directory:

```yaml
# flows/common/enter_pos.yaml
- tapOn:
    text: "POS & PAYMENT"
- waitForAnimationToEnd
- runFlow:
    when:
      visible: "Please enter staff PIN"
    commands:
      - inputText: "1234"
      - tapOn:
          text: "CONFIRM"
```

Then use in tests:
```yaml
- runFlow: ../common/enter_pos.yaml
```

## Debugging Commands Quick Reference

```bash
# Screenshot
adb exec-out screencap -p > /tmp/screen.png

# Force stop app
adb shell am force-stop <app_id>

# Check device connection
adb devices -l

# Run single test
maestro test <file.yaml>

# View hierarchy (for element IDs)
maestro hierarchy
```

## Bug Documentation

When a test failure reveals an **app bug** (not a test script issue):

1. Take screenshot of the error state
2. Document in BUG_REPORT.md:
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior
3. Simplify test to skip the broken feature (mark with TODO)
