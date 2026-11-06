#!/usr/bin/env python3
"""
optimize_vehicle_svgs.py
========================
Shrinks the vehicle illustrations of car-leasing-card without visible change.

What it does
  1. Rewrites path data with integer, relative coordinates (viewBox is 1536 x 1024,
     the card shows it about 260 px wide, so 1 unit is about 0.17 px).
  2. Re-fits runs of very short cubic curves (the sources come from a raster trace)
     with fewer curves, within --tolerance units. Corners are preserved.
  3. Merges consecutive <path> elements that share the same attributes, only when
     their bounding boxes do not overlap, so the rendering does not change.
  4. Drops the default --vehicle-color rule (the card sets the variable itself).

Input paths must use absolute M, L, C, Z commands (the format of the current sources).

Usage
  python optimize_vehicle_svgs.py SRC_DIR DST_DIR [--tolerance 0.6] [--pattern "*.svg.txt"]

Requires: Python 3.9+, numpy.
"""
import argparse, glob, math, os, re, sys
import numpy as np


TOK = re.compile(r'[MLCZ]|-?\d*\.?\d+')

def t10(tok):
    a, _, b = tok.partition('.')
    neg = a.startswith('-')
    a = a.lstrip('-') or '0'
    b = (b + '00')[:2]
    v = int(a) * 10 + int(b[0]) + (1 if int(b[1]) >= 5 else 0)
    return -v if neg else v

def parse(d):
    """-> list of subpaths; subpath = (start(x,y), [segments]) ; seg = ('L',x,y) | ('C',x1,y1,x2,y2,x,y); closed flag. Tenths of a unit."""
    toks = TOK.findall(d)
    assert re.sub(r'[MLCZ]|-?\d*\.?\d+|[\s,]', '', d) == ''
    i = 0; cmd = None; subs = []; cur = None
    N = {'M': 2, 'L': 2, 'C': 6, 'Z': 0}
    while i < len(toks):
        if toks[i] in N:
            cmd = toks[i]; i += 1
            if cmd == 'Z':
                cur['closed'] = True; continue
        n = N[cmd]
        v = [t10(t) for t in toks[i:i+n]]; i += n
        if cmd == 'M':
            cur = {'start': (v[0], v[1]), 'segs': [], 'closed': False}; subs.append(cur); cmd = 'L'
        elif cmd == 'L':
            cur['segs'].append(('L', *v))
        else:
            cur['segs'].append(('C', *v))
    return subs



def P(x, y): return np.array([x, y], float)

def cub(p0, p1, p2, p3, t):
    t = np.asarray(t)[:, None]; mt = 1 - t
    return mt**3*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t**3*p3

def dcub(p0, p1, p2, p3, t):
    t = np.asarray(t)[:, None]; mt = 1 - t
    return 3*mt*mt*(p1-p0) + 6*mt*t*(p2-p1) + 3*t*t*(p3-p2)

def d2cub(p0, p1, p2, p3, t):
    t = np.asarray(t)[:, None]; mt = 1 - t
    return 6*mt*(p2-2*p1+p0) + 6*t*(p3-2*p2+p1)

def unit(v):
    n = np.linalg.norm(v)
    return v / n if n > 1e-9 else None

def seg_pts(p0, seg):
    p0 = P(*p0)
    if seg[0] == 'L':
        return p0, P(*seg[1:3]), P(*seg[1:3]), P(*seg[1:3]), 'L'
    return p0, P(seg[1], seg[2]), P(seg[3], seg[4]), P(seg[5], seg[6]), 'C'

def out_tan(p0, s):
    a, b, c, d, k = seg_pts(p0, s)
    for v in ((b - a), (c - a), (d - a)):
        u = unit(v)
        if u is not None: return u
    return None

def in_tan(p0, s):
    a, b, c, d, k = seg_pts(p0, s)
    for v in ((d - c), (d - b), (d - a)):
        u = unit(v)
        if u is not None: return u
    return None

def angle(u, v):
    if u is None or v is None: return 0.0
    return math.degrees(math.acos(max(-1, min(1, float(u @ v)))))

SAMPLES = 8

def sample_seg(p0, s):
    a, b, c, d, k = seg_pts(p0, s)
    if k == 'L':
        t = np.linspace(0, 1, SAMPLES + 1)[1:]
        return a + (d - a) * t[:, None]
    t = np.linspace(0, 1, SAMPLES + 1)[1:]
    return cub(a, b, c, d, t)

def fit_cubic(pts, t0, t1):
    """pts: (n,2) incl. endpoints. t0 unit out-tangent at start, t1 unit tangent at end pointing BACK. returns (p1,p2,err,u)"""
    n = len(pts)
    p0, p3 = pts[0], pts[-1]
    d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))]
    if d[-1] < 1e-9: return None
    u = d / d[-1]
    seglen = np.linalg.norm(p3 - p0)
    for it in range(5):
        mt = 1 - u
        B0 = mt**3; B1 = 3*mt*mt*u; B2 = 3*mt*u*u; B3 = u**3
        A1 = t0[None, :] * B1[:, None]; A2 = t1[None, :] * B2[:, None]
        C00 = (A1*A1).sum(); C01 = (A1*A2).sum(); C11 = (A2*A2).sum()
        tmp = pts - (p0[None, :]*(B0+B1)[:, None] + p3[None, :]*(B2+B3)[:, None])
        X0 = (A1*tmp).sum(); X1 = (A2*tmp).sum()
        det = C00*C11 - C01*C01
        if abs(det) > 1e-12:
            a1 = (X0*C11 - X1*C01)/det; a2 = (C00*X1 - C01*X0)/det
        else:
            a1 = a2 = seglen/3
        eps = 1e-6*seglen
        if a1 < eps or a2 < eps or a1 > 3*seglen or a2 > 3*seglen:
            a1 = a2 = seglen/3
        p1 = p0 + t0*a1; p2 = p3 + t1*a2
        # Newton reparam
        q = cub(p0, p1, p2, p3, u); q1 = dcub(p0, p1, p2, p3, u); q2 = d2cub(p0, p1, p2, p3, u)
        diff = q - pts
        num = (diff*q1).sum(axis=1); den = (q1*q1).sum(axis=1) + (diff*q2).sum(axis=1)
        den = np.where(np.abs(den) < 1e-9, 1e-9, den)
        un = np.clip(u - num/den, 0, 1)
        un[0] = 0; un[-1] = 1
        un = np.maximum.accumulate(un)
        u = un
    q = cub(p0, p1, p2, p3, u)
    err = np.linalg.norm(q - pts, axis=1)
    return p1, p2, err

def fit_runs(start, segs, eps):
    """segs: list of original segs of one run. returns list of output segs ('L',x,y) | ('C',...) in tenths floats."""
    K = [P(*start)]
    for s in segs: K.append(P(*(s[-2:])))
    pts_per = []
    p = start
    for s in segs:
        pts_per.append(sample_seg(p, s)); p = s[-2:]
    pstart = [start] + [s[-2:] for s in segs[:-1]]
    out_t = [out_tan(pstart[i], segs[i]) for i in range(len(segs))]
    in_t = [in_tan(pstart[i], segs[i]) for i in range(len(segs))]

    def rec(i, j):
        if j - i == 1:
            return [segs[i]]
        t0 = out_t[i]; t1 = in_t[j-1]
        if t0 is None or t1 is None:
            return rec(i, (i+j)//2) + rec((i+j)//2, j)
        pts = np.vstack([K[i][None, :]] + pts_per[i:j])
        # endpoints exact
        r = fit_cubic(pts, t0, -t1)
        if r is not None:
            p1, p2, err = r
            if err.max() <= eps:
                return [('C', p1[0], p1[1], p2[0], p2[1], K[j][0], K[j][1])]
            k = int(np.argmax(err))
            m = i + max(1, min(j-i-1, (k - 1) // SAMPLES + (1 if (k-1) % SAMPLES >= SAMPLES//2 else 0)))
            m = max(i+1, min(j-1, m))
        else:
            m = (i+j)//2
        return rec(i, m) + rec(m, j)
    return rec(0, len(segs))

def process_sub(sub, eps, corner_deg):
    start = sub['start']; segs = sub['segs']
    if not segs: return sub['start'], [], sub['closed']
    # drop closing L to start (z closes)
    p = start; pstarts = []
    for s in segs: pstarts.append(p); p = s[-2:]
    closed = sub['closed']
    # corners between seg i-1 and i
    n = len(segs)
    corner = [False]*n
    for i in range(1, n):
        corner[i] = angle(in_tan(pstarts[i-1], segs[i-1]), out_tan(pstarts[i], segs[i])) > corner_deg
    loop = closed and tuple(segs[-1][-2:]) == tuple(start)
    if loop:
        corner[0] = angle(in_tan(pstarts[-1], segs[-1]), out_tan(pstarts[0], segs[0])) > corner_deg
        # rotate to first corner
        if any(corner):
            r = corner.index(True)
            segs = segs[r:] + segs[:r]; pstarts = pstarts[r:] + pstarts[:r]; corner = corner[r:] + corner[:r]
            start = pstarts[0]
    # split runs
    runs = []; cur = []
    for i in range(n):
        if corner[i] and cur: runs.append(cur); cur = []
        cur.append(segs[i])
    if cur: runs.append(cur)
    out = []; p = start
    for run in runs:
        o = fit_runs(p, run, eps)
        out += o; p = run[-1][-2:]
    return start, out, closed

# ---------- emitting ----------
def rnd(v, grid):  # v in tenths -> multiple of grid (tenths)
    return int(math.floor(v / grid + 0.5)) * grid

def num(v):  # tenths int -> string
    neg = v < 0; v = abs(int(v)); ip, fp = divmod(v, 10)
    s = (str(ip) if ip else '') + ('.' + str(fp) if fp else '')
    if not s: s = '0'
    return ('-' if neg else '') + s

def join(vals):
    out = ''
    for t in vals:
        if not out: out = t
        elif t.startswith('-'): out += t
        elif t.startswith('.') and '.' in re.split(r'[- ]', out)[-1]: out += t
        else: out += ' ' + t
    return out

def collinear(p0, p1, p2, p3, tol):
    d = p3 - p0; L = np.linalg.norm(d)
    if L < 1e-9: return False
    n = np.array([-d[1], d[0]]) / L
    return abs((p1-p0) @ n) <= tol and abs((p2-p0) @ n) <= tol and 0 <= (p1-p0) @ d/L**2 <= 1 and 0 <= (p2-p0) @ d/L**2 <= 1

def emit_sub(start, segs, closed, grid, prev_pt, first):
    sx, sy = rnd(start[0], grid), rnd(start[1], grid)
    cx, cy = sx, sy
    items = []  # normalized (kind, abs pts)
    for s in segs:
        if s[0] == 'L':
            e = (rnd(s[1], grid), rnd(s[2], grid))
            if e != (cx, cy): items.append(('L', e)); cx, cy = e
        else:
            c1 = (rnd(s[1], grid), rnd(s[2], grid)); c2 = (rnd(s[3], grid), rnd(s[4], grid)); e = (rnd(s[5], grid), rnd(s[6], grid))
            if c1 == c2 == e == (cx, cy): continue
            if collinear(P(cx, cy), P(*c1), P(*c2), P(*e), grid*0.35):
                if e != (cx, cy): items.append(('L', e)); cx, cy = e
                continue
            items.append(('C', c1, c2, e)); cx, cy = e
    # merge consecutive collinear lines (same direction)
    merged = []
    for it in items:
        if it[0] == 'L' and merged and merged[-1][0] == 'L':
            a = merged[-1][1]; pp = merged[-2][-1] if len(merged) > 1 else (sx, sy)
            if collinear(P(*pp), P(*a), P(*a), P(*it[1]), grid*0.35) and (a[0]-pp[0])*(it[1][0]-a[0]) + (a[1]-pp[1])*(it[1][1]-a[1]) > 0:
                merged[-1] = ('L', it[1]); continue
        merged.append(it)
    items = merged
    if closed and items and items[-1][0] == 'L' and items[-1][1] == (sx, sy):
        items.pop()
    # text
    if first: txt = 'M' + join([num(sx), num(sy)])
    else: txt = 'm' + join([num(sx - prev_pt[0]), num(sy - prev_pt[1])])
    cx, cy = sx, sy; last = None; prev_c2 = None
    for it in items:
        if it[0] == 'L':
            dx, dy = it[1][0]-cx, it[1][1]-cy
            if dy == 0: cmd, body = 'h', num(dx)
            elif dx == 0: cmd, body = 'v', num(dy)
            else: cmd, body = 'l', join([num(dx), num(dy)])
            cx, cy = it[1]; prev_c2 = None
        else:
            _, c1, c2, e = it
            smooth = prev_c2 is not None and (2*cx - prev_c2[0], 2*cy - prev_c2[1]) == c1
            if smooth:
                cmd, body = 's', join([num(c2[0]-cx), num(c2[1]-cy), num(e[0]-cx), num(e[1]-cy)])
            else:
                cmd, body = 'c', join([num(c1[0]-cx), num(c1[1]-cy), num(c2[0]-cx), num(c2[1]-cy), num(e[0]-cx), num(e[1]-cy)])
            prev_c2 = c2; cx, cy = e
        if cmd == last:
            txt += (' ' if not body.startswith('-') else '') + body
        else:
            txt += cmd + body
        last = cmd
    if closed: txt += 'z'; end = (sx, sy)
    else: end = (cx, cy)
    return txt, end

def optimize_d(d, eps, grid, corner_deg=30):
    subs = parse(d)
    out = ''; prev = None; first = True
    for sb in subs:
        start, segs, closed = process_sub(sb, eps, corner_deg)
        t, end = emit_sub(start, segs, closed, grid, prev, first)
        out += t; prev = end; first = False
    return out


NUMRE = re.compile(r'-?(?:\d+\.?\d*|\.\d+)')
CMDRE = re.compile(r'([MmLlHhVvCcSsZz])([^MmLlHhVvCcSsZz]*)')

def path_bboxes(d):
    """bbox of every subpath in a compact path (control points included, conservative)."""
    boxes = []; cx = cy = sx = sy = 0.0; cur = None
    def add(x, y):
        nonlocal cur
        if cur is None: cur = [x, y, x, y]
        else:
            cur[0] = min(cur[0], x); cur[1] = min(cur[1], y); cur[2] = max(cur[2], x); cur[3] = max(cur[3], y)
    for c, args in CMDRE.findall(d):
        v = [float(x) for x in NUMRE.findall(args)]
        rel = c.islower(); C = c.upper()
        if C == 'Z':
            if cur: boxes.append(cur); cur = None
            cx, cy = sx, sy; continue
        i = 0
        if C == 'M':
            if cur: boxes.append(cur); cur = None
            x, y = v[0], v[1]
            if rel: x += cx; y += cy
            cx, cy = x, y; sx, sy = x, y; add(cx, cy); i = 2
            while i < len(v):  # implicit lineto
                x, y = v[i], v[i+1]
                if rel: x += cx; y += cy
                cx, cy = x, y; add(cx, cy); i += 2
            continue
        while i < len(v):
            if C == 'L':
                x, y = v[i], v[i+1]; i += 2
                if rel: x += cx; y += cy
            elif C == 'H':
                x = v[i] + (cx if rel else 0); y = cy; i += 1
            elif C == 'V':
                y = v[i] + (cy if rel else 0); x = cx; i += 1
            elif C == 'C':
                for k in (0, 2):
                    px, py = v[i+k], v[i+k+1]
                    if rel: px += cx; py += cy
                    add(px, py)
                x, y = v[i+4], v[i+5]; i += 6
                if rel: x += cx; y += cy
            elif C == 'S':
                px, py = v[i], v[i+1]
                if rel: px += cx; py += cy
                add(px, py)
                x, y = v[i+2], v[i+3]; i += 4
                if rel: x += cx; y += cy
            cx, cy = x, y; add(cx, cy)
    if cur: boxes.append(cur)
    return boxes

def overlap(a, b):
    return not (a[2] < b[0] or b[2] < a[0] or a[3] < b[1] or b[3] < a[1])

PATH = re.compile(r'<path ([^>]*?) d="([^"]+)"([^>]*)/>')

def merge_paths(svg):
    """merge consecutive <path> with identical attributes when their shapes cannot overlap."""
    out = []; pos = 0; run = None  # run: dict(attrs, ds, boxes, start, end)
    def flush():
        nonlocal run
        if run is None: return
        out.append('<path ' + run['attrs'] + ' d="' + ''.join(run['ds']) + '"/>')
        run = None
    for m in PATH.finditer(svg):
        between = svg[pos:m.start()]
        attrs = (m.group(1) + m.group(3)).strip()
        d = m.group(2)
        if between.strip() != '':
            flush(); out.append(between)
        boxes = path_bboxes(d)
        if run is not None and run['attrs'] == attrs and not any(overlap(b, o) for b in boxes for o in run['boxes']):
            run['ds'].append(d); run['boxes'] += boxes
        else:
            flush()
            run = dict(attrs=attrs, ds=[d], boxes=list(boxes))
        pos = m.end()
    flush(); out.append(svg[pos:])
    return ''.join(out)

def tidy(svg):
    svg = svg.replace('.ha-vehicle{--vehicle-color:#ffffff}', '')
    svg = re.sub(r'(fill-opacity|opacity)="0\.(\d+)"', r'\1=".\2"', svg)
    svg = re.sub(r'>\s+<', '><', svg).strip()
    return svg



def main():
    ap = argparse.ArgumentParser(description="Optimize vehicle SVG files.")
    ap.add_argument("src"); ap.add_argument("dst")
    ap.add_argument("--tolerance", type=float, default=0.6, help="max curve deviation in viewBox units (default 0.6)")
    ap.add_argument("--pattern", default="*.svg*", help="input file pattern (default *.svg*)")
    a = ap.parse_args()
    os.makedirs(a.dst, exist_ok=True)
    eps = int(round(a.tolerance * 10)); grid = 10
    tot_a = tot_b = 0
    for f in sorted(glob.glob(os.path.join(a.src, a.pattern))):
        name = re.sub(r"(\.svg)?(\.txt)?$", "", os.path.basename(f))
        s = open(f, encoding="utf-8").read()
        s2 = tidy(s)
        s2 = re.sub(r' d="([^"]+)"', lambda m: ' d="' + optimize_d(m.group(1), eps, grid) + '"', s2)
        o = tidy(merge_paths(tidy(s2)))
        open(os.path.join(a.dst, name + ".svg"), "w", encoding="utf-8").write(o)
        tot_a += len(s); tot_b += len(o)
        print(f"{name:28s} {len(s):8d} -> {len(o):8d} ({100*len(o)/len(s):.0f}%)", flush=True)
    print(f"TOTAL {tot_a} -> {tot_b} ({100*tot_b/max(tot_a,1):.0f}%)")

if __name__ == "__main__":
    main()
