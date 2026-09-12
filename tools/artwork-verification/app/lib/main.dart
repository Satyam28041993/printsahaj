import "package:file_picker/file_picker.dart";
import "package:flutter/material.dart";

import "api.dart";

void main() {
  runApp(const ArtworkVerificationApp());
}

class ArtworkVerificationApp extends StatelessWidget {
  const ArtworkVerificationApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Artwork Verification",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D9488),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const JobListPage(),
    );
  }
}

class JobListPage extends StatefulWidget {
  const JobListPage({super.key});

  @override
  State<JobListPage> createState() => _JobListPageState();
}

class _JobListPageState extends State<JobListPage> {
  late Future<List<dynamic>> _jobs;

  @override
  void initState() {
    super.initState();
    _jobs = listJobs();
  }

  void _reload() {
    setState(() {
      _jobs = listJobs();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Artwork Verification"),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _jobs,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return _ErrorPane(message: snapshot.error.toString(), onRetry: _reload);
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final jobs = snapshot.data!;
          if (jobs.isEmpty) {
            return const Center(
              child: Text("Abhi koi job nahi. Naya job banao."),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: jobs.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final job = jobs[index] as Map<String, dynamic>;
              return ListTile(
                tileColor: Theme.of(context).colorScheme.surfaceContainerLowest,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                title: Text("${job["job_id"]}  ·  ${job["file_name"]}"),
                subtitle: Text(job["customer"]?.toString() ?? ""),
                onTap: () async {
                  await Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => JobPage(jobId: job["job_id"].toString()),
                    ),
                  );
                  _reload();
                },
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => const NewJobPage()),
          );
          _reload();
        },
        label: const Text("Naya job"),
        icon: const Icon(Icons.add),
      ),
    );
  }
}

class NewJobPage extends StatefulWidget {
  const NewJobPage({super.key});

  @override
  State<NewJobPage> createState() => _NewJobPageState();
}

class _NewJobPageState extends State<NewJobPage> {
  final _code = TextEditingController();
  final _name = TextEditingController();
  final _customer = TextEditingController();
  final _declaration = TextEditingController();
  final _colours = TextEditingController();
  final _labelW = TextEditingController();
  final _labelH = TextEditingController();
  final _mandatory = TextEditingController();
  final _paper = TextEditingController();
  String? _error;
  bool _saving = false;

  @override
  void dispose() {
    _code.dispose();
    _name.dispose();
    _customer.dispose();
    _declaration.dispose();
    _colours.dispose();
    _labelW.dispose();
    _labelH.dispose();
    _mandatory.dispose();
    _paper.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final payload = <String, dynamic>{
        "job_id": _code.text.trim(),
        "file_name": _name.text.trim(),
        "customer": _customer.text.trim(),
        "print_type": "Flexo",
      };
      if (_declaration.text.trim().isNotEmpty) {
        payload["colour_declaration"] = _declaration.text.trim();
        payload["colour_list"] = _colours.text
            .split(",")
            .map((item) => item.trim())
            .where((item) => item.isNotEmpty)
            .toList();
      }
      if (_labelW.text.trim().isNotEmpty && _labelH.text.trim().isNotEmpty) {
        payload["label_size_mm"] = [
          double.parse(_labelW.text.trim()),
          double.parse(_labelH.text.trim()),
        ];
      }
      if (_paper.text.trim().isNotEmpty) {
        payload["paper"] = _paper.text.trim();
      }
      if (_mandatory.text.trim().isNotEmpty) {
        payload["mandatory_texts"] = _mandatory.text
            .split(",")
            .map((item) => item.trim())
            .where((item) => item.isNotEmpty)
            .toList();
      }
      await saveJob(payload);
      if (!mounted) {
        return;
      }
      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(builder: (_) => JobPage(jobId: _code.text.trim())),
      );
    } catch (error) {
      setState(() {
        _error = error.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Naya job")),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _code,
            decoration: const InputDecoration(labelText: "Job code"),
          ),
          TextField(
            controller: _name,
            decoration: const InputDecoration(labelText: "Artwork ka naam"),
          ),
          TextField(
            controller: _customer,
            decoration: const InputDecoration(labelText: "Customer"),
          ),
          TextField(
            controller: _declaration,
            decoration: const InputDecoration(labelText: "Rang line"),
          ),
          TextField(
            controller: _colours,
            decoration: const InputDecoration(
              labelText: "Rang ke naam (comma se)",
            ),
          ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _labelW,
                  decoration: const InputDecoration(labelText: "Label width mm"),
                  keyboardType: TextInputType.number,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _labelH,
                  decoration: const InputDecoration(labelText: "Label height mm"),
                  keyboardType: TextInputType.number,
                ),
              ),
            ],
          ),
          TextField(
            controller: _paper,
            decoration: const InputDecoration(labelText: "Paper"),
          ),
          TextField(
            controller: _mandatory,
            decoration: const InputDecoration(
              labelText: "Zaroori likhai (comma se)",
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _saving ? null : _save,
            child: Text(_saving ? "Saving…" : "Job banao"),
          ),
        ],
      ),
    );
  }
}

class JobPage extends StatefulWidget {
  const JobPage({super.key, required this.jobId});

  final String jobId;

  @override
  State<JobPage> createState() => _JobPageState();
}

class _JobPageState extends State<JobPage> {
  Map<String, dynamic>? _job;
  Map<String, dynamic>? _report;
  String? _error;
  bool _busy = false;
  final _remark = TextEditingController();
  final _by = TextEditingController();

  static const _slots = <(String, String, String)>[
    ("client_artwork", "1. Client artwork", "PDF ya image — jo client ne bheja"),
    ("approval", "2. First approval", "PDF ya image — jo client ko approval ke liye bheja"),
    ("vendor_composite", "3. Vendor artwork", "PDF ya image — ups, cylinder, paper, colour"),
    ("separations", "4. Colour separation", "PDF ya image — har rang / plate"),
    ("printout", "5. Printout photo", "PDF ya image — machine par jo print hua"),
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _remark.dispose();
    _by.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final job = await getJob(widget.jobId);
      setState(() {
        _job = job;
        _error = null;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
      });
    }
  }

  Future<void> _pick(String role) async {
    final result = await FilePicker.platform.pickFiles(
      withData: true,
      type: FileType.custom,
      allowedExtensions: const ["pdf", "png", "jpg", "jpeg", "webp"],
    );
    if (result == null || result.files.isEmpty) {
      return;
    }
    setState(() {
      _busy = true;
    });
    try {
      await uploadFile(jobId: widget.jobId, role: role, file: result.files.first);
      await _load();
    } catch (error) {
      setState(() {
        _error = error.toString();
      });
    } finally {
      setState(() {
        _busy = false;
      });
    }
  }

  Future<void> _run() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final report = await runReport(widget.jobId);
      setState(() {
        _report = report;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
      });
    } finally {
      setState(() {
        _busy = false;
      });
    }
  }

  Future<void> _saveRemark() async {
    if (_remark.text.trim().isEmpty) {
      return;
    }
    try {
      await addRemark(
        jobId: widget.jobId,
        remark: _remark.text,
        by: _by.text,
      );
      _remark.clear();
      final report = await runReport(widget.jobId);
      setState(() {
        _report = report;
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final files = (_job?["files"] as Map<String, dynamic>?) ?? {};
    return Scaffold(
      appBar: AppBar(title: Text(widget.jobId)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            "Yeh website nahi hai. Yeh verification tool hai.",
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          if (_error != null)
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ..._slots.map((slot) {
            final present = files[slot.$1] != null;
            return Card(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    ListTile(
                      title: Text(slot.$2),
                      subtitle: Text(present ? files[slot.$1].toString() : slot.$3),
                      trailing: TextButton(
                        onPressed: _busy ? null : () => _pick(slot.$1),
                        child: Text(present ? "Badlo" : "Upload"),
                      ),
                    ),
                    if (present)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        child: Image.network(
                          "${apiBase()}/api/jobs/${Uri.encodeComponent(widget.jobId)}/files/${slot.$1}/preview?page=1",
                          height: 180,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stack) => Text(
                            "Preview nahi khula. File phir se upload karo.",
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _busy ? null : _run,
            icon: const Icon(Icons.rule),
            label: const Text("Sab match karo — report nikalo"),
          ),
          if (_busy) const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          ),
          if (_report != null) ...[
            const SizedBox(height: 24),
            _ReportView(report: _report!),
            const SizedBox(height: 16),
            TextField(
              controller: _by,
              decoration: const InputDecoration(labelText: "Remark kisne likha"),
            ),
            TextField(
              controller: _remark,
              decoration: const InputDecoration(
                labelText: "Remark",
                hintText: "Jo theek laga / jo galat laga — yahan likho",
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 8),
            OutlinedButton(onPressed: _saveRemark, child: const Text("Remark save karo")),
          ],
        ],
      ),
    );
  }
}

class _ReportView extends StatelessWidget {
  const _ReportView({required this.report});

  final Map<String, dynamic> report;

  @override
  Widget build(BuildContext context) {
    final findings = report["findings"] as List<dynamic>? ?? [];
    final flags = report["flags"] as List<dynamic>? ?? [];
    final notChecked = report["not_checked"] as List<dynamic>? ?? [];
    final checks = report["checks"] as List<dynamic>? ?? [];
    final remarks = report["remarks"] as Map<String, dynamic>? ?? {};
    final counts = report["counts"] as Map<String, dynamic>? ?? {};

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "${counts["findings"]} certain  ·  ${counts["flags"]} judge karo  ·  "
          "${counts["checks_not_run"]} checks nahi chale",
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        const Text(
          "Yeh report PASS / APPROVED / FAIL nahi kehti. Faisla tumhara hai.",
        ),
        _Block(
          title: "Certain findings",
          color: const Color(0xFFB45309),
          items: findings,
        ),
        _Block(
          title: "Judge karo (flags)",
          color: const Color(0xFF0369A1),
          items: flags,
        ),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Jo check nahi chala", style: Theme.of(context).textTheme.titleSmall),
                ...checks
                    .where((item) => item is Map && item["ran"] == false)
                    .map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text("• ${item["title"]}: ${item["not_run_reason"]}"),
                      ),
                    ),
              ],
            ),
          ),
        ),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Jo yeh tool check hi nahi karta", style: Theme.of(context).textTheme.titleSmall),
                ...notChecked.map((item) => Text("• $item")),
              ],
            ),
          ),
        ),
        if (remarks["overall"] != null || (remarks["items"] as List<dynamic>? ?? []).isNotEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Remarks", style: Theme.of(context).textTheme.titleSmall),
                  if (remarks["overall"] != null)
                    Text("${remarks["overall"]["by"]}: ${remarks["overall"]["remark"]}"),
                  ...(remarks["items"] as List<dynamic>? ?? []).map(
                    (item) => Text("${item["by"]}: ${item["remark"]}"),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _Block extends StatelessWidget {
  const _Block({required this.title, required this.color, required this.items});

  final String title;
  final Color color;
  final List<dynamic> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleSmall?.copyWith(color: color)),
            if (items.isEmpty) const Text("None"),
            ...items.map((item) {
              final map = item as Map<String, dynamic>;
              return Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("• ${map["summary"]}"),
                    if (map["expected"] != null) Text("  Expected: ${map["expected"]}"),
                    if (map["found"] != null) Text("  Found: ${map["found"]}"),
                    if (map["location"] != null) Text("  Look at: ${map["location"]}"),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _ErrorPane extends StatelessWidget {
  const _ErrorPane({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            FilledButton(onPressed: onRetry, child: const Text("Dobara try")),
          ],
        ),
      ),
    );
  }
}
