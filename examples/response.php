<!DOCTYPE html>
<html>
<head>
	<title>response handler</title>
</head>
<body>
<?php
if (isset($_GET['error']) {
	$success = 'false';
	$errorstr = $_GET['error_reason'];
} else {
	$success = 'true';
	$errorstr = '';
}
?>
<script>
	window.opener.handleFbResponse(<?php echo $success ?>, '<?php echo $errorstr ?>');
	window.close();
</script>
</body>
</html>
